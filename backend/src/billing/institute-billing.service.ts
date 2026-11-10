import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateBatchDto,
  CreateEnrollmentDto,
  PlatformSlipDto,
  UpgradeDto,
} from './dto/billing.dto';
import { PlanLimitService } from './plan-limit.service';

@Injectable()
export class InstituteBillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly limits: PlanLimitService,
  ) {}

  getUsage(organisationId: string) {
    return this.limits.getUsage(organisationId);
  }

  async getSubscription(organisationId: string) {
    const sub = await this.prisma.organisationSubscription.findFirst({
      where: { organisationId },
      orderBy: { createdAt: 'desc' },
      include: { plan: true },
    });
    if (!sub) return null;
    return {
      id: sub.id,
      status: sub.status,
      plan: {
        id: sub.plan.id,
        code: sub.plan.code,
        name: sub.plan.name,
        priceLkr: sub.plan.priceLkr,
        maxBatches: sub.plan.maxBatches,
        maxStudents: sub.plan.maxStudents,
        maxStaff: sub.plan.maxStaff,
      },
      currentPeriodStart: sub.currentPeriodStart.toISOString(),
      currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null,
    };
  }

  async upgrade(dto: UpgradeDto) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { code: dto.planCode },
    });
    if (!plan || !plan.active) {
      throw new NotFoundException('Plan not found');
    }
    if (plan.priceLkr <= 0) {
      // Free: assign immediately
      const existing = await this.prisma.organisationSubscription.findFirst({
        where: { organisationId: dto.organisationId },
        orderBy: { createdAt: 'desc' },
      });
      if (existing) {
        await this.prisma.organisationSubscription.update({
          where: { id: existing.id },
          data: { planId: plan.id, status: 'ACTIVE' },
        });
      } else {
        await this.prisma.organisationSubscription.create({
          data: {
            organisationId: dto.organisationId,
            planId: plan.id,
            status: 'ACTIVE',
          },
        });
      }
      return {
        mode: 'immediate' as const,
        planCode: plan.code,
        invoice: null,
      };
    }

    const invoice = await this.prisma.platformInvoice.create({
      data: {
        organisationId: dto.organisationId,
        planId: plan.id,
        amountLkr: plan.priceLkr,
        status: 'AWAITING_SLIP',
      },
    });

    const platformBank = await this.prisma.bankAccount.findFirst({
      where: { isPlatform: true },
    });

    return {
      mode: 'invoice' as const,
      planCode: plan.code,
      invoice: {
        id: invoice.id,
        amountLkr: invoice.amountLkr,
        status: invoice.status,
      },
      platformBank: platformBank
        ? {
            bankName: platformBank.bankName,
            accountName: platformBank.accountName,
            accountNumber: platformBank.accountNumber,
            branch: platformBank.branch,
          }
        : null,
    };
  }

  async uploadPlatformSlip(dto: PlatformSlipDto) {
    const invoice = await this.prisma.platformInvoice.findUnique({
      where: { id: dto.invoiceId },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (invoice.organisationId !== dto.organisationId) {
      throw new BadRequestException('Invoice does not belong to organisation');
    }
    if (
      invoice.status !== 'AWAITING_SLIP' &&
      invoice.status !== 'REJECTED'
    ) {
      throw new BadRequestException('Invoice is not awaiting a slip');
    }

    return this.prisma.platformInvoice.update({
      where: { id: invoice.id },
      data: {
        status: 'UNDER_REVIEW',
        slipReference: dto.slipReference,
        note: dto.note,
        rejectionReason: null,
      },
    });
  }

  async createBatch(dto: CreateBatchDto) {
    await this.limits.assertCanCreateBatch(dto.organisationId);
    return this.prisma.batch.create({
      data: {
        organisationId: dto.organisationId,
        name: dto.name,
      },
    });
  }

  async createEnrollment(dto: CreateEnrollmentDto) {
    await this.limits.assertCanEnrollStudent(dto.organisationId);
    return this.prisma.instituteEnrollment.create({
      data: {
        organisationId: dto.organisationId,
        displayName: dto.displayName,
        batchId: dto.batchId,
        studentUserId: dto.studentUserId,
      },
    });
  }

  listBatches(organisationId: string) {
    return this.prisma.batch.findMany({
      where: { organisationId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
