import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrgScopeGuard } from '../common/guards/org-scope.guard';
import { UpsertBankAccountDto } from './dto/bank-account.dto';

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

  @UseGuards(JwtAuthGuard, OrgScopeGuard)
  @Get(':organisationId/bank-account')
  async getBank(@Param('organisationId') organisationId: string) {
    const account = await this.prisma.bankAccount.findFirst({
      where: { organisationId, isPlatform: false },
      orderBy: { createdAt: 'asc' },
    });
    return account
      ? {
          id: account.id,
          bankName: account.bankName,
          accountName: account.accountName,
          accountNumber: account.accountNumber,
          branch: account.branch,
        }
      : null;
  }

  @UseGuards(JwtAuthGuard, OrgScopeGuard)
  @Put(':organisationId/bank-account')
  async upsertBank(
    @Param('organisationId') organisationId: string,
    @Body() dto: UpsertBankAccountDto,
  ) {
    const existing = await this.prisma.bankAccount.findFirst({
      where: { organisationId, isPlatform: false },
      orderBy: { createdAt: 'asc' },
    });
    const data = {
      bankName: dto.bankName.trim(),
      accountName: dto.accountName.trim(),
      accountNumber: dto.accountNumber.trim(),
      branch: dto.branch?.trim() || null,
      isPlatform: false,
      organisationId,
    };
    const account = existing
      ? await this.prisma.bankAccount.update({
          where: { id: existing.id },
          data,
        })
      : await this.prisma.bankAccount.create({ data });
    return {
      id: account.id,
      bankName: account.bankName,
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      branch: account.branch,
    };
  }
}
