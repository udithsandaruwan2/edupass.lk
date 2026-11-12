import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLecturerDto, UpdateLecturerDto } from './dto/lecturer.dto';

function mapLecturer(row: {
  id: string;
  organisationId: string;
  name: string;
  title: string | null;
  subjects: string[];
  bio: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    organisationId: row.organisationId,
    name: row.name,
    title: row.title,
    subjects: row.subjects,
    bio: row.bio,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

@Injectable()
export class LecturersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async listForOrganisation(organisationId: string) {
    const rows = await this.prisma.lecturerProfile.findMany({
      where: { organisationId },
      orderBy: { name: 'asc' },
    });
    return rows.map(mapLecturer);
  }

  async create(dto: CreateLecturerDto) {
    const org = await this.prisma.organisation.findUnique({
      where: { id: dto.organisationId },
    });
    if (!org) throw new NotFoundException('Organisation not found');

    const row = await this.prisma.lecturerProfile.create({
      data: {
        organisationId: dto.organisationId,
        name: dto.name,
        title: dto.title,
        subjects: dto.subjects ?? [],
        bio: dto.bio,
        status: dto.status ?? 'active',
      },
    });

    if (dto.email) {
      void this.mail.lecturerInvite(dto.email, dto.name, org.name);
    }

    return mapLecturer(row);
  }

  async update(id: string, organisationId: string, dto: UpdateLecturerDto) {
    const existing = await this.prisma.lecturerProfile.findFirst({
      where: { id, organisationId },
    });
    if (!existing) throw new NotFoundException('Lecturer not found');

    const row = await this.prisma.lecturerProfile.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.subjects !== undefined ? { subjects: dto.subjects } : {}),
        ...(dto.bio !== undefined ? { bio: dto.bio } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      },
    });
    return mapLecturer(row);
  }

  async remove(id: string, organisationId: string) {
    const existing = await this.prisma.lecturerProfile.findFirst({
      where: { id, organisationId },
    });
    if (!existing) throw new NotFoundException('Lecturer not found');
    await this.prisma.lecturerProfile.delete({ where: { id } });
    return { id, deleted: true };
  }

  async listPublic() {
    const rows = await this.prisma.lecturerProfile.findMany({
      where: { status: 'active' },
      orderBy: { name: 'asc' },
      take: 500,
    });
    return rows.map(mapLecturer);
  }

  async getPublic(id: string) {
    const row = await this.prisma.lecturerProfile.findFirst({
      where: { id, status: 'active' },
    });
    if (!row) throw new NotFoundException('Lecturer not found');
    return mapLecturer(row);
  }
}
