import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SeatHoldDto, UpsertVenueLayoutDto } from './dto/seats.dto';

const HOLD_TTL_MS = 15 * 60 * 1000;

@Injectable()
export class SeatsService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertVenueLayout(
    seminarId: string,
    organisationId: string,
    dto: UpsertVenueLayoutDto,
  ) {
    const seminar = await this.prisma.seminar.findFirst({
      where: { id: seminarId, organisationId },
    });
    if (!seminar) throw new NotFoundException('Seminar not found');

    const layout = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.venueLayout.findUnique({
        where: { seminarId },
      });

      const row =
        existing ?
          await tx.venueLayout.update({
            where: { id: existing.id },
            data: { name: dto.name, rows: dto.rows, cols: dto.cols },
          })
        : await tx.venueLayout.create({
            data: {
              organisationId,
              seminarId,
              name: dto.name,
              rows: dto.rows,
              cols: dto.cols,
            },
          });

      if (dto.seats?.length) {
        await tx.seat.deleteMany({ where: { layoutId: row.id } });
        await tx.seat.createMany({
          data: dto.seats.map((s) => ({
            layoutId: row.id,
            row: s.row,
            col: s.col,
            label: s.label,
            status: s.status ?? 'available',
          })),
        });
      } else if (!existing) {
        const generated: Prisma.SeatCreateManyInput[] = [];
        for (let r = 0; r < dto.rows; r += 1) {
          for (let c = 0; c < dto.cols; c += 1) {
            generated.push({
              layoutId: row.id,
              row: r,
              col: c,
              label: `${String.fromCharCode(65 + r)}${c + 1}`,
              status: 'available',
            });
          }
        }
        await tx.seat.createMany({ data: generated });
      }

      return row;
    });

    const seats = await this.prisma.seat.findMany({
      where: { layoutId: layout.id },
      orderBy: [{ row: 'asc' }, { col: 'asc' }],
    });

    return {
      id: layout.id,
      seminarId,
      name: layout.name,
      rows: layout.rows,
      cols: layout.cols,
      seats: seats.map((s) => ({
        id: s.id,
        row: s.row,
        col: s.col,
        label: s.label,
        status: s.status,
      })),
      createdAt: layout.createdAt.toISOString(),
    };
  }

  async listAvailableBySlug(slug: string) {
    const seminar = await this.prisma.seminar.findUnique({
      where: { slug },
      include: {
        venueLayout: { include: { seats: true } },
      },
    });
    if (!seminar?.venueLayout) {
      throw new NotFoundException('No seat map for this seminar');
    }

    await this.releaseExpiredHolds();

    const held = await this.prisma.seatHold.findMany({
      where: {
        status: 'held',
        expiresAt: { gt: new Date() },
        seat: { layoutId: seminar.venueLayout.id },
      },
      select: { seatId: true },
    });
    const heldIds = new Set(held.map((h) => h.seatId));

    const available = seminar.venueLayout.seats.filter(
      (s) =>
        (s.status === 'available' || s.status === 'held') && !heldIds.has(s.id),
    );

    return {
      seminarId: seminar.id,
      slug: seminar.slug,
      layoutId: seminar.venueLayout.id,
      seats: available.map((s) => ({
        id: s.id,
        row: s.row,
        col: s.col,
        label: s.label,
        status: 'available',
      })),
    };
  }

  async createHolds(userId: string, dto: SeatHoldDto) {
    const seminar = await this.prisma.seminar.findUnique({
      where: { id: dto.seminarId },
      include: { venueLayout: true },
    });
    if (!seminar?.venueLayout) {
      throw new NotFoundException('Seminar has no seat layout');
    }

    await this.releaseExpiredHolds();

    const seats = await this.prisma.seat.findMany({
      where: {
        id: { in: dto.seatIds },
        layoutId: seminar.venueLayout.id,
      },
    });
    if (seats.length !== dto.seatIds.length) {
      throw new BadRequestException('One or more seats not found');
    }

    for (const seat of seats) {
      if (seat.status === 'sold' || seat.status === 'taken') {
        throw new BadRequestException(`Seat ${seat.label} is not available`);
      }
      const active = await this.prisma.seatHold.findFirst({
        where: {
          seatId: seat.id,
          status: 'held',
          expiresAt: { gt: new Date() },
        },
      });
      if (active && active.userId !== userId) {
        throw new BadRequestException(`Seat ${seat.label} is held`);
      }
    }

    const expiresAt = new Date(Date.now() + HOLD_TTL_MS);
    const holds = await this.prisma.$transaction(async (tx) => {
      const created = [];
      for (const seatId of dto.seatIds) {
        await tx.seatHold.deleteMany({
          where: {
            seatId,
            userId,
            status: 'held',
          },
        });
        const h = await tx.seatHold.create({
          data: {
            seatId,
            userId,
            expiresAt,
            status: 'held',
          },
        });
        await tx.seat.update({
          where: { id: seatId },
          data: { status: 'held' },
        });
        created.push(h);
      }
      return created;
    });

    return holds.map((h) => ({
      id: h.id,
      seatId: h.seatId,
      expiresAt: h.expiresAt.toISOString(),
      status: h.status,
    }));
  }

  async linkHoldsToOrder(
    userId: string,
    orderId: string,
    seatIds: string[],
  ): Promise<void> {
    if (!seatIds.length) return;
    await this.prisma.seatHold.updateMany({
      where: {
        userId,
        seatId: { in: seatIds },
        status: 'held',
        expiresAt: { gt: new Date() },
      },
      data: { orderId },
    });
  }

  /** Call after payment approved. */
  async convertHoldsForOrder(orderId: string): Promise<void> {
    const holds = await this.prisma.seatHold.findMany({
      where: { orderId, status: 'held' },
    });
    if (!holds.length) return;

    await this.prisma.$transaction(async (tx) => {
      for (const h of holds) {
        await tx.seatHold.update({
          where: { id: h.id },
          data: { status: 'converted' },
        });
        await tx.seat.update({
          where: { id: h.seatId },
          data: { status: 'sold' },
        });
      }
    });
  }

  private async releaseExpiredHolds(): Promise<void> {
    const expired = await this.prisma.seatHold.findMany({
      where: {
        status: 'held',
        expiresAt: { lte: new Date() },
      },
    });
    if (!expired.length) return;

    await this.prisma.$transaction(async (tx) => {
      for (const h of expired) {
        await tx.seatHold.update({
          where: { id: h.id },
          data: { status: 'expired' },
        });
        const other = await tx.seatHold.findFirst({
          where: {
            seatId: h.seatId,
            status: 'held',
            expiresAt: { gt: new Date() },
          },
        });
        if (!other) {
          const seat = await tx.seat.findUnique({ where: { id: h.seatId } });
          if (seat && seat.status === 'held') {
            await tx.seat.update({
              where: { id: h.seatId },
              data: { status: 'available' },
            });
          }
        }
      }
    });
  }
}
