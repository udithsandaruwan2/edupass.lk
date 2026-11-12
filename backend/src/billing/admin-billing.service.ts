import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CommerceOrderStatus,
  FeeLineStatus,
  Prisma,
  RefundStatus,
} from '@prisma/client';
import { CheckoutService } from '../commerce/checkout.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  UpsertAnnouncementDto,
  UpsertBannerDto,
  UpsertCategoryDto,
  UpsertFaqDto,
} from './dto/admin-cms.dto';
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
  constructor(
    private readonly prisma: PrismaService,
    private readonly checkout: CheckoutService,
  ) {}

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

  listUsers() {
    return this.prisma.user
      .findMany({
        orderBy: { createdAt: 'desc' },
        take: 500,
        select: {
          id: true,
          email: true,
          name: true,
          globalRole: true,
          isPlatformAdmin: true,
          createdAt: true,
        },
      })
      .then((rows) =>
        rows.map((u) => ({
          ...u,
          createdAt: u.createdAt.toISOString(),
        })),
      );
  }

  listOrganisations() {
    return this.prisma.organisation
      .findMany({
        orderBy: { createdAt: 'desc' },
        take: 500,
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          status: true,
          createdAt: true,
        },
      })
      .then((rows) =>
        rows.map((o) => ({
          ...o,
          createdAt: o.createdAt.toISOString(),
        })),
      );
  }

  listSeminars() {
    return this.prisma.seminar
      .findMany({
        orderBy: { createdAt: 'desc' },
        take: 500,
        select: {
          id: true,
          organisationId: true,
          slug: true,
          title: true,
          status: true,
          startsAt: true,
          createdAt: true,
        },
      })
      .then((rows) =>
        rows.map((s) => ({
          ...s,
          startsAt: s.startsAt.toISOString(),
          createdAt: s.createdAt.toISOString(),
        })),
      );
  }

  listOrders() {
    return this.prisma.order
      .findMany({
        orderBy: { createdAt: 'desc' },
        take: 500,
        select: {
          id: true,
          studentUserId: true,
          organisationId: true,
          status: true,
          totalLkr: true,
          createdAt: true,
        },
      })
      .then((rows) =>
        rows.map((o) => ({
          ...o,
          createdAt: o.createdAt.toISOString(),
        })),
      );
  }

  listTickets() {
    return this.prisma.ticket
      .findMany({
        orderBy: { createdAt: 'desc' },
        take: 500,
        select: {
          id: true,
          code: true,
          orderId: true,
          seminarId: true,
          status: true,
          createdAt: true,
        },
      })
      .then((rows) =>
        rows.map((t) => ({
          ...t,
          createdAt: t.createdAt.toISOString(),
        })),
      );
  }

  listRefunds() {
    return this.prisma.refundRequest
      .findMany({
        orderBy: { createdAt: 'desc' },
        take: 500,
        select: {
          id: true,
          orderId: true,
          studentUserId: true,
          amountLkr: true,
          status: true,
          createdAt: true,
        },
      })
      .then((rows) =>
        rows.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
        })),
      );
  }

  async reviewRefund(id: string, action: 'approve' | 'reject') {
    const refund = await this.prisma.refundRequest.findUnique({
      where: { id },
      include: { order: true },
    });
    if (!refund) throw new NotFoundException('Refund not found');
    if (refund.status !== RefundStatus.OPEN) {
      throw new BadRequestException('Refund already reviewed');
    }

    if (action === 'reject') {
      const updated = await this.prisma.refundRequest.update({
        where: { id },
        data: { status: RefundStatus.REJECTED },
      });
      return {
        id: updated.id,
        status: updated.status,
        createdAt: updated.createdAt.toISOString(),
      };
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const r = await tx.refundRequest.update({
        where: { id },
        data: { status: RefundStatus.APPROVED },
      });
      await tx.order.update({
        where: { id: refund.orderId },
        data: { status: CommerceOrderStatus.REFUNDED },
      });
      await this.checkout.voidTicketsForOrder(tx, refund.orderId);
      await tx.platformFeeLine.updateMany({
        where: { orderId: refund.orderId, status: FeeLineStatus.ACTIVE },
        data: { status: FeeLineStatus.VOID },
      });
      return r;
    });
    return {
      id: updated.id,
      status: updated.status,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  // —— CMS ——

  listBanners() {
    return this.prisma.banner
      .findMany({ orderBy: { sortOrder: 'asc' } })
      .then((rows) =>
        rows.map((b) => ({
          id: b.id,
          title: b.title,
          active: b.active,
          sortOrder: b.sortOrder,
          createdAt: b.createdAt.toISOString(),
        })),
      );
  }

  async createBanner(dto: UpsertBannerDto) {
    const b = await this.prisma.banner.create({ data: dto });
    return {
      id: b.id,
      title: b.title,
      createdAt: b.createdAt.toISOString(),
    };
  }

  async updateBanner(id: string, dto: Partial<UpsertBannerDto>) {
    const b = await this.prisma.banner.update({ where: { id }, data: dto });
    return {
      id: b.id,
      title: b.title,
      createdAt: b.createdAt.toISOString(),
    };
  }

  async deleteBanner(id: string) {
    await this.prisma.banner.delete({ where: { id } });
    return { id, deleted: true };
  }

  listFaqs() {
    return this.prisma.faq
      .findMany({ orderBy: { sortOrder: 'asc' } })
      .then((rows) =>
        rows.map((f) => ({
          id: f.id,
          question: f.question,
          active: f.active,
          createdAt: f.createdAt.toISOString(),
        })),
      );
  }

  async createFaq(dto: UpsertFaqDto) {
    const f = await this.prisma.faq.create({ data: dto });
    return {
      id: f.id,
      question: f.question,
      createdAt: f.createdAt.toISOString(),
    };
  }

  async updateFaq(id: string, dto: Partial<UpsertFaqDto>) {
    const f = await this.prisma.faq.update({ where: { id }, data: dto });
    return {
      id: f.id,
      question: f.question,
      createdAt: f.createdAt.toISOString(),
    };
  }

  async deleteFaq(id: string) {
    await this.prisma.faq.delete({ where: { id } });
    return { id, deleted: true };
  }

  listAnnouncements() {
    return this.prisma.announcement
      .findMany({ orderBy: { createdAt: 'desc' } })
      .then((rows) =>
        rows.map((a) => ({
          id: a.id,
          title: a.title,
          audience: a.audience,
          active: a.active,
          createdAt: a.createdAt.toISOString(),
        })),
      );
  }

  async createAnnouncement(dto: UpsertAnnouncementDto) {
    const a = await this.prisma.announcement.create({ data: dto });
    return {
      id: a.id,
      title: a.title,
      createdAt: a.createdAt.toISOString(),
    };
  }

  async updateAnnouncement(id: string, dto: Partial<UpsertAnnouncementDto>) {
    const a = await this.prisma.announcement.update({
      where: { id },
      data: dto,
    });
    return {
      id: a.id,
      title: a.title,
      createdAt: a.createdAt.toISOString(),
    };
  }

  async deleteAnnouncement(id: string) {
    await this.prisma.announcement.delete({ where: { id } });
    return { id, deleted: true };
  }

  listCategories() {
    return this.prisma.category
      .findMany({ orderBy: { name: 'asc' } })
      .then((rows) =>
        rows.map((c) => ({
          id: c.id,
          slug: c.slug,
          name: c.name,
          createdAt: c.createdAt.toISOString(),
        })),
      );
  }

  async createCategory(dto: UpsertCategoryDto) {
    const c = await this.prisma.category.create({ data: dto });
    return {
      id: c.id,
      slug: c.slug,
      name: c.name,
      createdAt: c.createdAt.toISOString(),
    };
  }

  async updateCategory(id: string, dto: Partial<UpsertCategoryDto>) {
    const c = await this.prisma.category.update({ where: { id }, data: dto });
    return {
      id: c.id,
      slug: c.slug,
      name: c.name,
      createdAt: c.createdAt.toISOString(),
    };
  }

  async deleteCategory(id: string) {
    await this.prisma.category.delete({ where: { id } });
    return { id, deleted: true };
  }
}
