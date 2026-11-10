import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommissionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resolve %: plan override → global PlatformSettings (default 5).
   * Snapshotted onto Order at checkout — never re-read later for fee math.
   */
  async resolvePercentForOrganisation(
    organisationId: string,
  ): Promise<Prisma.Decimal> {
    const [sub, settings] = await Promise.all([
      this.prisma.organisationSubscription.findFirst({
        where: {
          organisationId,
          status: { in: ['ACTIVE', 'TRIALING'] },
        },
        orderBy: { createdAt: 'desc' },
        include: { plan: true },
      }),
      this.prisma.platformSettings.findUnique({ where: { id: 'default' } }),
    ]);

    if (sub?.plan.ticketCommissionPercent != null) {
      return sub.plan.ticketCommissionPercent;
    }
    return settings?.ticketCommissionPercent ?? new Prisma.Decimal(5);
  }

  feeAmountLkr(subtotalLkr: number, percent: Prisma.Decimal | number): number {
    const p = typeof percent === 'number' ? percent : Number(percent);
    return Math.round((subtotalLkr * p) / 100);
  }
}
