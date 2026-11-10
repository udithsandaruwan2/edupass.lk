import { Prisma } from '@prisma/client';
import { CommissionService } from './commission.service';

describe('CommissionService', () => {
  const prisma = {
    organisationSubscription: { findFirst: jest.fn() },
    platformSettings: { findUnique: jest.fn() },
  };
  const service = new CommissionService(prisma as never);

  beforeEach(() => jest.clearAllMocks());

  it('uses plan override when present', async () => {
    prisma.organisationSubscription.findFirst.mockResolvedValue({
      plan: { ticketCommissionPercent: new Prisma.Decimal(0) },
    });
    prisma.platformSettings.findUnique.mockResolvedValue({
      ticketCommissionPercent: new Prisma.Decimal(5),
    });
    const pct = await service.resolvePercentForOrganisation('org1');
    expect(Number(pct)).toBe(0);
  });

  it('falls back to global settings', async () => {
    prisma.organisationSubscription.findFirst.mockResolvedValue(null);
    prisma.platformSettings.findUnique.mockResolvedValue({
      ticketCommissionPercent: new Prisma.Decimal(6),
    });
    const pct = await service.resolvePercentForOrganisation('org1');
    expect(Number(pct)).toBe(6);
  });

  it('rounds fee amount', () => {
    expect(service.feeAmountLkr(1500, 5)).toBe(75);
    expect(service.feeAmountLkr(1000, new Prisma.Decimal(5))).toBe(50);
  });
});
