import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EntitlementCode } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  EntitlementGuard,
  RequireEntitlement,
} from '../common/guards/entitlement.guard';
import { OrgScopeGuard } from '../common/guards/org-scope.guard';
import {
  CreateBatchDto,
  CreateEnrollmentDto,
  PlatformSlipDto,
  UpgradeDto,
} from './dto/billing.dto';
import { InstituteBillingService } from './institute-billing.service';

@Controller('institute')
@UseGuards(JwtAuthGuard, OrgScopeGuard, EntitlementGuard)
@RequireEntitlement(EntitlementCode.INSTITUTE)
export class InstituteBillingController {
  constructor(private readonly billing: InstituteBillingService) {}

  @Get('billing/usage')
  usage(@Query('organisationId') organisationId: string) {
    return this.billing.getUsage(organisationId);
  }

  @Get('billing/subscription')
  subscription(@Query('organisationId') organisationId: string) {
    return this.billing.getSubscription(organisationId);
  }

  @Post('billing/upgrade')
  upgrade(@Body() dto: UpgradeDto) {
    return this.billing.upgrade(dto);
  }

  @Post('billing/slips')
  uploadSlip(@Body() dto: PlatformSlipDto) {
    return this.billing.uploadPlatformSlip(dto);
  }

  @Get('batches')
  listBatches(@Query('organisationId') organisationId: string) {
    return this.billing.listBatches(organisationId);
  }

  @Post('batches')
  createBatch(@Body() dto: CreateBatchDto) {
    return this.billing.createBatch(dto);
  }

  @Post('enrollments')
  createEnrollment(@Body() dto: CreateEnrollmentDto) {
    return this.billing.createEnrollment(dto);
  }
}
