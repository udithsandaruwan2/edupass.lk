import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CheckInMode,
  EntitlementCode,
  EntitlementStatus,
  Prisma,
  SeminarStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateSeminarDto,
  ListSeminarsQueryDto,
  PublishSeminarDto,
  UpdateSeminarDto,
} from './dto/seminar.dto';
import { slugifyTitle, toSeminarResponse } from './seminars.mapper';

const ticketInclude = {
  ticketTypes: { orderBy: { priceLkr: 'asc' as const } },
} satisfies Prisma.SeminarInclude;

@Injectable()
export class SeminarsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(query: ListSeminarsQueryDto) {
    const where: Prisma.SeminarWhereInput = {
      status: SeminarStatus.PUBLISHED,
      startsAt: { gt: new Date() },
    };
    if (query.subject) where.subject = { equals: query.subject, mode: 'insensitive' };
    if (query.district) where.district = { equals: query.district, mode: 'insensitive' };
    if (query.level) where.level = query.level;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { summary: { contains: query.q, mode: 'insensitive' } },
        { subject: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const rows = await this.prisma.seminar.findMany({
      where,
      include: ticketInclude,
      orderBy: { startsAt: 'asc' },
    });
    return rows.map(toSeminarResponse);
  }

  async getBySlug(slug: string) {
    const row = await this.prisma.seminar.findUnique({
      where: { slug },
      include: ticketInclude,
    });
    if (!row || row.status !== SeminarStatus.PUBLISHED) {
      throw new NotFoundException('Seminar not found');
    }
    return toSeminarResponse(row);
  }

  async listCategories() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        icon: true,
      },
    });
  }

  async listForOrganisation(organisationId: string) {
    const rows = await this.prisma.seminar.findMany({
      where: { organisationId },
      include: ticketInclude,
      orderBy: { startsAt: 'asc' },
    });
    return rows.map(toSeminarResponse);
  }

  async getForOrganisation(id: string, organisationId: string) {
    const row = await this.requireOwned(id, organisationId);
    return toSeminarResponse(row);
  }

  async create(dto: CreateSeminarDto) {
    await this.assertSeminarsEntitlement(dto.organisationId);
    const slug = await this.uniqueSlug(dto.slug ?? slugifyTitle(dto.title));
    const row = await this.prisma.seminar.create({
      data: {
        organisationId: dto.organisationId,
        slug,
        title: dto.title,
        subject: dto.subject,
        level: dto.level,
        categoryId: dto.categoryId,
        lecturerProfileId: dto.lecturerProfileId,
        mode: dto.mode,
        venue: dto.venue,
        district: dto.district,
        startsAt: new Date(dto.startsAt),
        durationHours: dto.durationHours,
        summary: dto.summary,
        description: dto.description,
        highlights: dto.highlights ?? [],
        agenda: (dto.agenda ?? []) as unknown as Prisma.InputJsonValue,
        checkInMode: dto.checkInMode,
        streamJoinUrl: dto.streamJoinUrl?.trim() || null,
        featured: dto.featured ?? false,
        language: dto.language ?? 'Sinhala',
        image: dto.image,
        status: SeminarStatus.DRAFT,
        ticketTypes: {
          create: dto.ticketTypes.map((t) => ({
            name: t.name,
            description: t.description ?? '',
            priceLkr: t.priceLkr,
            capacity: t.capacity,
          })),
        },
      },
      include: ticketInclude,
    });
    return toSeminarResponse(row);
  }

  async update(id: string, organisationId: string, dto: UpdateSeminarDto) {
    const existing = await this.requireOwned(id, organisationId);
    if (existing.status === SeminarStatus.CANCELLED) {
      throw new BadRequestException('Cancelled seminars cannot be edited');
    }

    const data: Prisma.SeminarUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.subject !== undefined) data.subject = dto.subject;
    if (dto.level !== undefined) data.level = dto.level;
    if (dto.mode !== undefined) data.mode = dto.mode;
    if (dto.venue !== undefined) data.venue = dto.venue;
    if (dto.district !== undefined) data.district = dto.district;
    if (dto.startsAt !== undefined) data.startsAt = new Date(dto.startsAt);
    if (dto.durationHours !== undefined) data.durationHours = dto.durationHours;
    if (dto.summary !== undefined) data.summary = dto.summary;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.highlights !== undefined) data.highlights = dto.highlights;
    if (dto.agenda !== undefined) {
      data.agenda = dto.agenda as unknown as Prisma.InputJsonValue;
    }
    if (dto.checkInMode !== undefined) data.checkInMode = dto.checkInMode;
    if (dto.streamJoinUrl !== undefined) {
      data.streamJoinUrl = dto.streamJoinUrl?.trim() || null;
    }
    if (dto.featured !== undefined) data.featured = dto.featured;
    if (dto.language !== undefined) data.language = dto.language;
    if (dto.image !== undefined) data.image = dto.image;
    if (dto.categoryId !== undefined) {
      data.category = dto.categoryId
        ? { connect: { id: dto.categoryId } }
        : { disconnect: true };
    }
    if (dto.lecturerProfileId !== undefined) {
      data.lecturerProfile = dto.lecturerProfileId
        ? { connect: { id: dto.lecturerProfileId } }
        : { disconnect: true };
    }

    if (dto.ticketTypes) {
      const locked = existing.ticketTypes.some((t) => t.sold > 0);
      if (locked && existing.status !== SeminarStatus.DRAFT) {
        throw new BadRequestException(
          'Ticket types locked after sales; cancel and recreate instead',
        );
      }
      await this.prisma.ticketType.deleteMany({ where: { seminarId: id } });
      data.ticketTypes = {
        create: dto.ticketTypes.map((t) => ({
          name: t.name,
          description: t.description ?? '',
          priceLkr: t.priceLkr,
          capacity: t.capacity,
        })),
      };
    }

    const row = await this.prisma.seminar.update({
      where: { id },
      data,
      include: ticketInclude,
    });
    return toSeminarResponse(row);
  }

  async publish(
    id: string,
    organisationId: string,
    dto: PublishSeminarDto = {},
  ) {
    const existing = await this.requireOwned(id, organisationId);
    if (existing.status === SeminarStatus.CANCELLED) {
      throw new BadRequestException('Cancelled seminars cannot be published');
    }
    const checkInMode = dto.checkInMode ?? existing.checkInMode;
    if (!checkInMode) {
      throw new BadRequestException(
        'checkInMode is required to publish (QR_GATE | JOIN_LINK | BOTH)',
      );
    }
    if (!existing.ticketTypes.length) {
      throw new BadRequestException('At least one ticket type is required');
    }

    const row = await this.prisma.seminar.update({
      where: { id },
      data: {
        status: SeminarStatus.PUBLISHED,
        checkInMode,
      },
      include: ticketInclude,
    });
    return toSeminarResponse(row);
  }

  async cancel(id: string, organisationId: string) {
    await this.requireOwned(id, organisationId);
    const row = await this.prisma.seminar.update({
      where: { id },
      data: { status: SeminarStatus.CANCELLED },
      include: ticketInclude,
    });
    return toSeminarResponse(row);
  }

  private async requireOwned(id: string, organisationId: string) {
    const row = await this.prisma.seminar.findUnique({
      where: { id },
      include: ticketInclude,
    });
    if (!row) throw new NotFoundException('Seminar not found');
    if (row.organisationId !== organisationId) {
      throw new ForbiddenException('Not your organisation seminar');
    }
    return row;
  }

  private async assertSeminarsEntitlement(organisationId: string) {
    const entitlement = await this.prisma.organisationEntitlement.findUnique({
      where: {
        organisationId_code: {
          organisationId,
          code: EntitlementCode.SEMINARS,
        },
      },
    });
    if (!entitlement || entitlement.status !== EntitlementStatus.ACTIVE) {
      throw new ForbiddenException('Organisation lacks SEMINARS entitlement');
    }
  }

  private async uniqueSlug(base: string): Promise<string> {
    let candidate = base;
    let n = 0;
    while (await this.prisma.seminar.findUnique({ where: { slug: candidate } })) {
      n += 1;
      candidate = `${base}-${n}`;
    }
    return candidate;
  }
}

/** Re-export for tests that assert enum values without importing Prisma. */
export const PUBLISH_REQUIRES: CheckInMode[] = [
  CheckInMode.QR_GATE,
  CheckInMode.JOIN_LINK,
  CheckInMode.BOTH,
];
