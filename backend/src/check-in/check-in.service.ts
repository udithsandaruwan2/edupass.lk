import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CheckInResult, TicketLifecycle } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CheckInDto } from './dto/check-in.dto';

export function normalizeTicketCode(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/^EDUPASS-DEMO:/, '')
    .replace(/^EDUPASS:/, '');
}

@Injectable()
export class CheckInService {
  constructor(private readonly prisma: PrismaService) {}

  async checkIn(scannedByUserId: string, dto: CheckInDto) {
    const seminar = await this.prisma.seminar.findUnique({
      where: { id: dto.seminarId },
    });
    if (!seminar) throw new NotFoundException('Seminar not found');
    if (seminar.organisationId !== dto.organisationId) {
      throw new ForbiddenException('Seminar is not in this organisation');
    }

    const code = normalizeTicketCode(dto.code);
    const ticket = await this.prisma.ticket.findUnique({ where: { code } });

    if (!ticket) {
      await this.audit({
        ticketId: null,
        seminarId: dto.seminarId,
        organisationId: dto.organisationId,
        scannedCode: code,
        result: CheckInResult.INVALID,
        message: `No ticket found with code ${code || '(empty)'}.`,
        scannedByUserId,
      });
      return {
        ok: false,
        result: CheckInResult.INVALID,
        message: `No ticket found with code ${code || '(empty)'}.`,
      };
    }

    if (ticket.organisationId !== dto.organisationId) {
      await this.audit({
        ticketId: ticket.id,
        seminarId: dto.seminarId,
        organisationId: dto.organisationId,
        scannedCode: code,
        result: CheckInResult.CROSS_TENANT,
        message: 'This ticket belongs to another organiser.',
        scannedByUserId,
      });
      return {
        ok: false,
        result: CheckInResult.CROSS_TENANT,
        message: 'This ticket belongs to another organiser.',
        ticket: this.mapTicket(ticket),
      };
    }

    if (ticket.seminarId !== dto.seminarId) {
      await this.audit({
        ticketId: ticket.id,
        seminarId: dto.seminarId,
        organisationId: dto.organisationId,
        scannedCode: code,
        result: CheckInResult.WRONG_SEMINAR,
        message: 'This ticket is for a different seminar.',
        scannedByUserId,
      });
      return {
        ok: false,
        result: CheckInResult.WRONG_SEMINAR,
        message: 'This ticket is for a different seminar.',
        ticket: this.mapTicket(ticket),
      };
    }

    if (ticket.status === TicketLifecycle.VOID) {
      await this.audit({
        ticketId: ticket.id,
        seminarId: dto.seminarId,
        organisationId: dto.organisationId,
        scannedCode: code,
        result: CheckInResult.VOID,
        message: 'This ticket has been voided.',
        scannedByUserId,
      });
      return {
        ok: false,
        result: CheckInResult.VOID,
        message: 'This ticket has been voided.',
        ticket: this.mapTicket(ticket),
      };
    }

    if (ticket.status === TicketLifecycle.PENDING) {
      await this.audit({
        ticketId: ticket.id,
        seminarId: dto.seminarId,
        organisationId: dto.organisationId,
        scannedCode: code,
        result: CheckInResult.INVALID,
        message: 'Payment not confirmed yet.',
        scannedByUserId,
      });
      return {
        ok: false,
        result: CheckInResult.INVALID,
        message: 'Payment not confirmed yet.',
        ticket: this.mapTicket(ticket),
      };
    }

    if (ticket.status === TicketLifecycle.CHECKED_IN) {
      await this.audit({
        ticketId: ticket.id,
        seminarId: dto.seminarId,
        organisationId: dto.organisationId,
        scannedCode: code,
        result: CheckInResult.DUPLICATE,
        message: 'Already checked in.',
        scannedByUserId,
      });
      throw new ConflictException({
        ok: false,
        result: CheckInResult.DUPLICATE,
        message: 'Already checked in.',
        ticket: this.mapTicket(ticket),
      });
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const t = await tx.ticket.update({
        where: { id: ticket.id },
        data: {
          status: TicketLifecycle.CHECKED_IN,
          checkedInAt: new Date(),
        },
      });
      await tx.checkInEvent.create({
        data: {
          ticketId: t.id,
          seminarId: dto.seminarId,
          organisationId: dto.organisationId,
          scannedCode: code,
          result: CheckInResult.ADMITTED,
          message: `Welcome, ${t.holderName}.`,
          scannedByUserId,
        },
      });
      return t;
    });

    return {
      ok: true,
      result: CheckInResult.ADMITTED,
      message: `Welcome, ${updated.holderName}.`,
      ticket: this.mapTicket(updated),
    };
  }

  async attendance(seminarId: string, organisationId: string) {
    const seminar = await this.prisma.seminar.findUnique({
      where: { id: seminarId },
    });
    if (!seminar) throw new NotFoundException('Seminar not found');
    if (seminar.organisationId !== organisationId) {
      throw new ForbiddenException('Seminar is not in this organisation');
    }

    const tickets = await this.prisma.ticket.findMany({
      where: {
        seminarId,
        organisationId,
        status: {
          in: [
            TicketLifecycle.VALID,
            TicketLifecycle.CHECKED_IN,
            TicketLifecycle.VOID,
          ],
        },
      },
      orderBy: [{ status: 'asc' }, { holderName: 'asc' }],
    });

    const checkedIn = tickets.filter(
      (t) => t.status === TicketLifecycle.CHECKED_IN,
    ).length;
    const valid = tickets.filter((t) => t.status === TicketLifecycle.VALID).length;

    return {
      seminarId,
      organisationId,
      totals: {
        total: tickets.length,
        checkedIn,
        remaining: valid,
      },
      tickets: tickets.map((t) => this.mapTicket(t)),
    };
  }

  private async audit(data: {
    ticketId: string | null;
    seminarId: string;
    organisationId: string;
    scannedCode: string;
    result: CheckInResult;
    message: string;
    scannedByUserId: string;
  }) {
    await this.prisma.checkInEvent.create({ data });
  }

  private mapTicket(t: {
    id: string;
    code: string;
    orderId: string;
    studentUserId: string;
    seminarId: string;
    ticketTypeId: string;
    organisationId: string;
    holderName: string;
    status: TicketLifecycle;
    checkedInAt: Date | null;
  }) {
    return {
      id: t.id,
      code: t.code,
      orderId: t.orderId,
      studentUserId: t.studentUserId,
      seminarId: t.seminarId,
      ticketTypeId: t.ticketTypeId,
      organisationId: t.organisationId,
      holderName: t.holderName,
      status: t.status,
      checkedInAt: t.checkedInAt?.toISOString() ?? null,
    };
  }
}
