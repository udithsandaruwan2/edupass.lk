import { ForbiddenException } from '@nestjs/common';
import { OrgScopeGuard } from './org-scope.guard';
import type { PrismaService } from '../../prisma/prisma.service';

describe('OrgScopeGuard', () => {
  const prisma = {
    staffMembership: {
      findUnique: jest.fn(),
    },
  } as unknown as PrismaService;

  const guard = new OrgScopeGuard(prisma);

  function ctx(user: unknown, organisationId?: string) {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user,
          params: organisationId ? { organisationId } : {},
          query: {},
        }),
      }),
    } as never;
  }

  it('allows platform admin without membership', async () => {
    await expect(
      guard.canActivate(
        ctx({ userId: 'u1', email: 'a@x.com', isPlatformAdmin: true }, 'org-b'),
      ),
    ).resolves.toBe(true);
  });

  it('rejects cross-tenant access', async () => {
    (prisma.staffMembership.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(
      guard.canActivate(
        ctx({ userId: 'u1', email: 'a@x.com', isPlatformAdmin: false }, 'org-b'),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows member of organisation', async () => {
    (prisma.staffMembership.findUnique as jest.Mock).mockResolvedValue({
      id: 'm1',
    });
    await expect(
      guard.canActivate(
        ctx({ userId: 'u1', email: 'a@x.com', isPlatformAdmin: false }, 'org-a'),
      ),
    ).resolves.toBe(true);
  });
});
