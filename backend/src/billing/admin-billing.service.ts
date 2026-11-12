import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  AssignSubscriptionDto,
  PatchOrganisationDto,
  UpdateSettingsDto,
  UpsertPlanDto,
} from './dto/billing.dto';

function mapPlan(p: {
  id: string;
  code: string;
  name: string;
  description: string | null;
  priceLkr: number;
  billingPeriod: string;
  maxBatches: number | null;
  maxStudents: number | null;
  maxStaff: number | null;
  maxSeminarsPerMonth: number | null;
  instituteEnabled: boolean;
  seminarsEnabled: boolean;
  ticketCommissionPercent: Prisma.Decimal | null;
  isPublic: boolean;
  sortOrder: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: p.id,
    code: p.code,
    name: p.name,
    description: p.description,
    priceLkr: p.priceLkr,
    billingPeriod: p.billingPeriod,
    maxBatches: p.maxBatches,
    maxStudents: p.maxStudents,
    maxStaff: p.maxStaff,
    maxSeminarsPerMonth: p.maxSeminarsPerMonth,
    instituteEnabled: p.instituteEnabled,
    seminarsEnabled: p.seminarsEnabled,
    ticketCommissionPercent:
      p.ticketCommissionPercent != null
        ? Number(p.ticketCommissionPercent)
        : null,
    isPublic: p.isPublic,
    sortOrder: p.sortOrder,
    active: p.active,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

@Injectable()
export class AdminBillingService {
  constructor(private readonly prisma: PrismaService) {}

  listPlans() {
    return this.prisma.subscriptionPlan
      .findMany({ orderBy: { sortOrder: 'asc' } })
      .then((rows) => rows.map(mapPlan));
  }

  async createPlan(dto: UpsertPlanDto) {
    const row = await this.prisma.subscriptionPlan.create({
      data: {
        code: dto.code,
        name: dto.name,
        description: dto.description,
        priceLkr: dto.priceLkr,
        billingPeriod: dto.billingPeriod,
        maxBatches: dto.maxBatches ?? null,
        maxStudents: dto.maxStudents ?? null,
        maxStaff: dto.maxStaff ?? null,
        maxSeminarsPerMonth: dto.maxSeminarsPerMonth ?? null,
        instituteEnabled: dto.instituteEnabled ?? true,
        seminarsEnabled: dto.seminarsEnabled ?? true,
        ticketCommissionPercent: dto.ticketCommissionPercent ?? null,
        isPublic: dto.isPublic ?? true,
        sortOrder: dto.sortOrder ?? 0,
        active: dto.active ?? true,
      },
    });
    return mapPlan(row);
  }

  async updatePlan(id: string, dto: Partial<UpsertPlanDto>) {
    const existing = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Plan not found');
    const row = await this.prisma.subscriptionPlan.update({
      where: { id },
      data: {
        ...(dto.code !== undefined ? { code: dto.code } : {}),
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.priceLkr !== undefined ? { priceLkr: dto.priceLkr } : {}),
        ...(dto.billingPeriod !== undefined
          ? { billingPeriod: dto.billingPeriod }
          : {}),
        ...(dto.maxBatches !== undefined ? { maxBatches: dto.maxBatches } : {}),
        ...(dto.maxStudents !== undefined
          ? { maxStudents: dto.maxStudents }
          : {}),
        ...(dto.maxStaff !== undefined ? { maxStaff: dto.maxStaff } : {}),
        ...(dto.maxSeminarsPerMonth !== undefined
          ? { maxSeminarsPerMonth: dto.maxSeminarsPerMonth }
          : {}),
        ...(dto.instituteEnabled !== undefined
          ? { instituteEnabled: dto.instituteEnabled }
          : {}),
        ...(dto.seminarsEnabled !== undefined
          ? { seminarsEnabled: dto.seminarsEnabled }
          : {}),
        ...(dto.ticketCommissionPercent !== undefined
          ? { ticketCommissionPercent: dto.ticketCommissionPercent }
          : {}),
        ...(dto.isPublic !== undefined ? { isPublic: dto.isPublic } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
        ...(dto.active !== undefined ? { active: dto.active } : {}),
      },
    });
    return mapPlan(row);
  }

  async getSettings() {
    const s = await this.prisma.platformSettings.upsert({
      where: { id: 'default' },
      update: {},
      create: { id: 'default', ticketCommissionPercent: 5 },
    });
    return {
      ticketCommissionPercent: Number(s.ticketCommissionPercent),
      payhereEnabled: s.payhereEnabled,
      updatedAt: s.updatedAt.toISOString(),
    };
  }

  async updateSettings(dto: UpdateSettingsDto) {
    const s = await this.prisma.platformSettings.upsert({
      where: { id: 'default' },
      update: {
        ...(dto.ticketCommissionPercent !== undefined
          ? { ticketCommissionPercent: dto.ticketCommissionPercent }
          : {}),
        ...(dto.payhereEnabled !== undefined
          ? { payhereEnabled: dto.payhereEnabled }
          : {}),
      },
      create: {
        id: 'default',
        ticketCommissionPercent: dto.ticketCommissionPercent ?? 5,
        payhereEnabled: dto.payhereEnabled ?? false,
      },
    });
    return {
      ticketCommissionPercent: Number(s.ticketCommissionPercent),
      payhereEnabled: s.payhereEnabled,
      updatedAt: s.updatedAt.toISOString(),
    };
  }

  async patchOrganisation(id: string, dto: PatchOrganisationDto) {
    const org = await this.prisma.organisation.findUnique({ where: { id } });
    if (!org) throw new NotFoundException('Organisation not found');
    const updated = await this.prisma.organisation.update({
      where: { id },
      data: { ...(dto.status !== undefined ? { status: dto.status } : {}) },
    });
    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      type: updated.type,
      status: updated.status,
    };
  }

  async assignSubscription(organisationId: string, dto: AssignSubscriptionDto) {
    const [org, plan] = await Promise.all([
      this.prisma.organisation.findUnique({ where: { id: organisationId } }),
      this.prisma.subscriptionPlan.findUnique({ where: { id: dto.planId } }),
    ]);
    if (!org) throw new NotFoundException('Organisation not found');
    if (!plan) throw new NotFoundException('Plan not found');

    const existing = await this.prisma.organisationSubscription.findFirst({
      where: { organisationId },
      orderBy: { createdAt: 'desc' },
    });
    const sub = existing
      ? await this.prisma.organisationSubscription.update({
          where: { id: existing.id },
          data: {
            planId: dto.planId,
            status: dto.status ?? 'ACTIVE',
          },
          include: { plan: true },
        })
      : await this.prisma.organisationSubscription.create({
          data: {
            organisationId,
            planId: dto.planId,
            status: dto.status ?? 'ACTIVE',
          },
          include: { plan: true },
        });

    return {
      id: sub.id,
      organisationId: sub.organisationId,
      status: sub.status,
      plan: mapPlan(sub.plan),
    };
  }

  async listPlatformFees() {
    const rows = await this.prisma.platformFeeLine.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { organisation: { select: { id: true, name: true, slug: true } } },
    });
    const active = rows.filter((r) => r.status === 'ACTIVE');
    const voided = rows.filter((r) => r.status === 'VOID');
    return {
      summary: {
        activeFeeLkr: active.reduce((n, r) => n + r.feeAmountLkr, 0),
        voidedFeeLkr: voided.reduce((n, r) => n + r.feeAmountLkr, 0),
        activeTicketSubtotalLkr: active.reduce((n, r) => n + r.ticketSubtotalLkr, 0),
        lineCount: rows.length,
        activeCount: active.length,
      },
      lines: rows.map((r) => ({
        id: r.id,
        orderId: r.orderId,
        organisationId: r.organisationId,
        organisationName: r.organisation.name,
        organisationSlug: r.organisation.slug,
        commissionPercent: Number(r.commissionPercent),
        ticketSubtotalLkr: r.ticketSubtotalLkr,
        feeAmountLkr: r.feeAmountLkr,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
      })),
    };
  }

  async listSubscriptionInvoices() {
    const rows = await this.prisma.platformInvoice.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { plan: true, organisation: true },
    });
    return rows.map((r) => ({
      id: r.id,
      organisationId: r.organisationId,
      organisationName: r.organisation.name,
      planCode: r.plan.code,
      amountLkr: r.amountLkr,
      status: r.status,
      slipReference: r.slipReference,
      paidAt: r.paidAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async reviewPlatformInvoice(
    id: string,
    action: 'approve' | 'reject',
    reason?: string,
  ) {
    const invoice = await this.prisma.platformInvoice.findUnique({
      where: { id },
      include: { plan: true },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');

    if (action === 'reject') {
      return this.prisma.platformInvoice.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejectionReason: reason ?? 'Rejected by admin',
        },
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const paid = await tx.platformInvoice.update({
        where: { id },
        data: { status: 'PAID', paidAt: new Date() },
      });
      const existing = await tx.organisationSubscription.findFirst({
        where: { organisationId: invoice.organisationId },
        orderBy: { createdAt: 'desc' },
      });
      if (existing) {
        await tx.organisationSubscription.update({
          where: { id: existing.id },
          data: { planId: invoice.planId, status: 'ACTIVE' },
        });
      } else {
        await tx.organisationSubscription.create({
          data: {
            organisationId: invoice.organisationId,
            planId: invoice.planId,
            status: 'ACTIVE',
          },
        });
      }
      return paid;
    });
  }
}
