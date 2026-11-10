import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type PlanUsage = {
  organisationId: string;
  plan: {
    id: string;
    code: string;
    name: string;
    maxBatches: number | null;
    maxStudents: number | null;
    maxStaff: number | null;
    maxSeminarsPerMonth: number | null;
    ticketCommissionPercent: number | null;
    priceLkr: number;
  } | null;
  counts: {
    batches: number;
    students: number;
    staff: number;
    seminarsThisMonth: number;
  };
  remaining: {
    batches: number | null;
    students: number | null;
    staff: number | null;
    seminarsThisMonth: number | null;
  };
};

@Injectable()
export class PlanLimitService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsage(organisationId: string): Promise<PlanUsage> {
    const org = await this.prisma.organisation.findUnique({
      where: { id: organisationId },
    });
    if (!org) throw new NotFoundException('Organisation not found');

    const sub = await this.prisma.organisationSubscription.findFirst({
      where: {
        organisationId,
        status: { in: ['ACTIVE', 'TRIALING'] },
      },
      orderBy: { createdAt: 'desc' },
      include: { plan: true },
    });

    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);

    const [batches, students, staff, seminarsThisMonth] = await Promise.all([
      this.prisma.batch.count({ where: { organisationId } }),
      this.prisma.instituteEnrollment.count({ where: { organisationId } }),
      this.prisma.staffMembership.count({ where: { organisationId } }),
      this.prisma.seminar.count({
        where: { organisationId, createdAt: { gte: monthStart } },
      }),
    ]);

    const plan = sub?.plan ?? null;
    const remaining = {
      batches: remainingOf(plan?.maxBatches ?? null, batches),
      students: remainingOf(plan?.maxStudents ?? null, students),
      staff: remainingOf(plan?.maxStaff ?? null, staff),
      seminarsThisMonth: remainingOf(
        plan?.maxSeminarsPerMonth ?? null,
        seminarsThisMonth,
      ),
    };

    return {
      organisationId,
      plan: plan
        ? {
            id: plan.id,
            code: plan.code,
            name: plan.name,
            maxBatches: plan.maxBatches,
            maxStudents: plan.maxStudents,
            maxStaff: plan.maxStaff,
            maxSeminarsPerMonth: plan.maxSeminarsPerMonth,
            ticketCommissionPercent:
              plan.ticketCommissionPercent != null
                ? Number(plan.ticketCommissionPercent)
                : null,
            priceLkr: plan.priceLkr,
          }
        : null,
      counts: { batches, students, staff, seminarsThisMonth },
      remaining,
    };
  }

  async assertCanCreateBatch(organisationId: string): Promise<void> {
    const usage = await this.getUsage(organisationId);
    if (usage.remaining.batches === 0) {
      throw new ForbiddenException({
        statusCode: 403,
        message: 'Plan batch limit reached — upgrade to create more batches',
        code: 'PLAN_LIMIT_BATCHES',
        usage,
      });
    }
  }

  async assertCanEnrollStudent(organisationId: string): Promise<void> {
    const usage = await this.getUsage(organisationId);
    if (usage.remaining.students === 0) {
      throw new ForbiddenException({
        statusCode: 403,
        message: 'Plan student limit reached — upgrade to enroll more students',
        code: 'PLAN_LIMIT_STUDENTS',
        usage,
      });
    }
  }

  async assertCanAddStaff(organisationId: string): Promise<void> {
    const usage = await this.getUsage(organisationId);
    if (usage.remaining.staff === 0) {
      throw new ForbiddenException({
        statusCode: 403,
        message: 'Plan staff limit reached — upgrade to add more staff',
        code: 'PLAN_LIMIT_STAFF',
        usage,
      });
    }
  }
}

function remainingOf(max: number | null, used: number): number | null {
  if (max == null) return null;
  return Math.max(0, max - used);
}
