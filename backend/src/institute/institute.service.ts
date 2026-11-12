import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StaffRole } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateSessionDto,
  InviteStaffDto,
  MarkAttendanceDto,
} from './dto/institute.dto';

@Injectable()
export class InstituteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async listStaff(organisationId: string) {
    const rows = await this.prisma.staffMembership.findMany({
      where: { organisationId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((m) => ({
      id: m.id,
      role: m.role,
      userId: m.userId,
      name: m.user.name,
      email: m.user.email,
      createdAt: m.createdAt.toISOString(),
    }));
  }

  async inviteStaff(dto: InviteStaffDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) {
      throw new NotFoundException(
        'No user with that email — they must register first',
      );
    }
    const org = await this.prisma.organisation.findUnique({
      where: { id: dto.organisationId },
    });
    if (!org) throw new NotFoundException('Organisation not found');

    const membership = await this.prisma.staffMembership.upsert({
      where: {
        userId_organisationId: {
          userId: user.id,
          organisationId: dto.organisationId,
        },
      },
      update: { role: dto.role ?? StaffRole.TEACHER },
      create: {
        userId: user.id,
        organisationId: dto.organisationId,
        role: dto.role ?? StaffRole.TEACHER,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    const role = membership.role;
    void this.mail.staffInvite(
      membership.user.email,
      membership.user.name,
      org.name,
      role,
    );

    return {
      id: membership.id,
      role: membership.role,
      userId: membership.userId,
      name: membership.user.name,
      email: membership.user.email,
    };
  }

  async listEnrollments(organisationId: string, batchId?: string) {
    const rows = await this.prisma.instituteEnrollment.findMany({
      where: {
        organisationId,
        ...(batchId ? { batchId } : {}),
      },
      orderBy: { displayName: 'asc' },
    });
    return rows.map((e) => ({
      id: e.id,
      batchId: e.batchId,
      displayName: e.displayName,
      studentUserId: e.studentUserId,
      status: e.status,
      createdAt: e.createdAt.toISOString(),
    }));
  }

  async createSession(dto: CreateSessionDto) {
    const batch = await this.prisma.batch.findUnique({
      where: { id: dto.batchId },
    });
    if (!batch || batch.organisationId !== dto.organisationId) {
      throw new BadRequestException('Batch not found for organisation');
    }
    const session = await this.prisma.classSession.create({
      data: {
        organisationId: dto.organisationId,
        batchId: dto.batchId,
        title: dto.title,
        startsAt: new Date(dto.startsAt),
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        notes: dto.notes,
      },
    });
    return this.mapSession(session);
  }

  async listSessions(organisationId: string, batchId?: string) {
    const rows = await this.prisma.classSession.findMany({
      where: {
        organisationId,
        ...(batchId ? { batchId } : {}),
      },
      orderBy: { startsAt: 'desc' },
    });
    return rows.map((s) => this.mapSession(s));
  }

  async getSessionAttendance(sessionId: string, organisationId: string) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      include: {
        attendance: true,
        batch: { include: { enrollments: true } },
      },
    });
    if (!session || session.organisationId !== organisationId) {
      throw new NotFoundException('Session not found');
    }
    const byEnrollment = new Map(
      session.attendance.map((a) => [a.enrollmentId, a]),
    );
    return {
      session: this.mapSession(session),
      /** Class roll — not CheckInEvent / seminar tickets. */
      roll: session.batch.enrollments.map((e) => {
        const mark = byEnrollment.get(e.id);
        return {
          enrollmentId: e.id,
          displayName: e.displayName,
          status: mark?.status ?? null,
          markedAt: mark?.markedAt.toISOString() ?? null,
          note: mark?.note ?? null,
        };
      }),
    };
  }

  async markAttendance(
    sessionId: string,
    markedByUserId: string,
    dto: MarkAttendanceDto,
  ) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
    });
    if (!session || session.organisationId !== dto.organisationId) {
      throw new NotFoundException('Session not found');
    }

    const results = [];
    for (const mark of dto.marks) {
      const enrollment = await this.prisma.instituteEnrollment.findUnique({
        where: { id: mark.enrollmentId },
      });
      if (
        !enrollment ||
        enrollment.organisationId !== dto.organisationId ||
        enrollment.batchId !== session.batchId
      ) {
        throw new BadRequestException(
          `Enrollment ${mark.enrollmentId} is not on this session's batch`,
        );
      }
      const row = await this.prisma.attendanceRecord.upsert({
        where: {
          sessionId_enrollmentId: {
            sessionId,
            enrollmentId: mark.enrollmentId,
          },
        },
        update: {
          status: mark.status,
          note: mark.note,
          markedByUserId,
          markedAt: new Date(),
        },
        create: {
          organisationId: dto.organisationId,
          sessionId,
          enrollmentId: mark.enrollmentId,
          status: mark.status,
          note: mark.note,
          markedByUserId,
        },
      });
      results.push({
        id: row.id,
        enrollmentId: row.enrollmentId,
        status: row.status,
        markedAt: row.markedAt.toISOString(),
      });
    }
    return { sessionId, marks: results };
  }

  private mapSession(s: {
    id: string;
    organisationId: string;
    batchId: string;
    title: string;
    startsAt: Date;
    endsAt: Date | null;
    notes: string | null;
    createdAt: Date;
  }) {
    return {
      id: s.id,
      organisationId: s.organisationId,
      batchId: s.batchId,
      title: s.title,
      startsAt: s.startsAt.toISOString(),
      endsAt: s.endsAt?.toISOString() ?? null,
      notes: s.notes,
      createdAt: s.createdAt.toISOString(),
    };
  }
}
