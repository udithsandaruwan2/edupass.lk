import { ForbiddenException } from '@nestjs/common';
import { PlanLimitService } from './plan-limit.service';

describe('PlanLimitService', () => {
  const prisma = {
    organisation: { findUnique: jest.fn() },
    organisationSubscription: { findFirst: jest.fn() },
    batch: { count: jest.fn() },
    instituteEnrollment: { count: jest.fn() },
    staffMembership: { count: jest.fn() },
    seminar: { count: jest.fn() },
  };
  const service = new PlanLimitService(prisma as never);

  beforeEach(() => jest.clearAllMocks());

  it('blocks batch create at Free cap', async () => {
    prisma.organisation.findUnique.mockResolvedValue({ id: 'org1' });
    prisma.organisationSubscription.findFirst.mockResolvedValue({
      plan: {
        id: 'p1',
        code: 'free',
        name: 'Free',
        maxBatches: 2,
        maxStudents: 50,
        maxStaff: 5,
        maxSeminarsPerMonth: 5,
        ticketCommissionPercent: null,
        priceLkr: 0,
      },
    });
    prisma.batch.count.mockResolvedValue(2);
    prisma.instituteEnrollment.count.mockResolvedValue(0);
    prisma.staffMembership.count.mockResolvedValue(1);
    prisma.seminar.count.mockResolvedValue(0);

    await expect(service.assertCanCreateBatch('org1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('allows batch when under cap', async () => {
    prisma.organisation.findUnique.mockResolvedValue({ id: 'org1' });
    prisma.organisationSubscription.findFirst.mockResolvedValue({
      plan: {
        id: 'p1',
        code: 'free',
        name: 'Free',
        maxBatches: 2,
        maxStudents: 50,
        maxStaff: 5,
        maxSeminarsPerMonth: 5,
        ticketCommissionPercent: null,
        priceLkr: 0,
      },
    });
    prisma.batch.count.mockResolvedValue(1);
    prisma.instituteEnrollment.count.mockResolvedValue(0);
    prisma.staffMembership.count.mockResolvedValue(1);
    prisma.seminar.count.mockResolvedValue(0);

    await expect(service.assertCanCreateBatch('org1')).resolves.toBeUndefined();
  });
});
