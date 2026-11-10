import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrgScopeGuard } from '../common/guards/org-scope.guard';

@Controller('organisations')
export class OrganisationsController {
  constructor(private readonly prisma: PrismaService) {}

  /** Tenant-scoped read used to prove OrgScope isolation (T-001). */
  @UseGuards(JwtAuthGuard, OrgScopeGuard)
  @Get(':organisationId/summary')
  async summary(@Param('organisationId') organisationId: string) {
    const org = await this.prisma.organisation.findUniqueOrThrow({
      where: { id: organisationId },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        status: true,
        entitlements: { select: { code: true, status: true } },
      },
    });
    return org;
  }
}
