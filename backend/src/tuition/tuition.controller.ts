import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EntitlementCode } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CurrentUser,
  type AuthUser,
} from '../common/decorators/current-user.decorator';
import {
  EntitlementGuard,
  RequireEntitlement,
} from '../common/guards/entitlement.guard';
import { OrgScopeGuard } from '../common/guards/org-scope.guard';
import {
  CreateTuitionFeePlanDto,
  CreateTuitionInvoiceDto,
  RecordCashPaymentDto,
  RecordTuitionSlipDto,
  ReviewTuitionSlipDto,
} from './dto/tuition.dto';
import { TuitionService } from './tuition.service';

@Controller('institute/tuition')
@UseGuards(JwtAuthGuard, OrgScopeGuard, EntitlementGuard)
@RequireEntitlement(EntitlementCode.INSTITUTE)
export class TuitionController {
  constructor(private readonly tuition: TuitionService) {}

  @Get('fee-plans')
  listPlans(@Query('organisationId') organisationId: string) {
    return this.tuition.listFeePlans(organisationId);
  }

  @Post('fee-plans')
  createPlan(@Body() dto: CreateTuitionFeePlanDto) {
    return this.tuition.createFeePlan(dto);
  }

  @Get('invoices')
  listInvoices(
    @Query('organisationId') organisationId: string,
    @Query('enrollmentId') enrollmentId?: string,
  ) {
    return this.tuition.listInvoices(organisationId, enrollmentId);
  }

  @Post('invoices')
  createInvoice(@Body() dto: CreateTuitionInvoiceDto) {
    return this.tuition.createInvoice(dto);
  }

  @Post('invoices/:id/cash')
  recordCash(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: RecordCashPaymentDto,
  ) {
    return this.tuition.recordCash(id, user.userId, dto);
  }

  @Post('invoices/:id/slips')
  recordSlip(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: RecordTuitionSlipDto,
  ) {
    return this.tuition.recordSlip(id, user.userId, dto);
  }

  @Post('payments/:id/review')
  reviewSlip(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: ReviewTuitionSlipDto,
  ) {
    return this.tuition.reviewSlip(id, user.userId, dto);
  }
}
