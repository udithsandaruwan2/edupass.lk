import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { AdminBillingService } from './admin-billing.service';
import {
  AssignSubscriptionDto,
  PatchOrganisationDto,
  UpdateSettingsDto,
  UpsertPlanDto,
} from './dto/billing.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly admin: AdminBillingService) {}

  @Get('plans')
  listPlans() {
    return this.admin.listPlans();
  }

  @Post('plans')
  createPlan(@Body() dto: UpsertPlanDto) {
    return this.admin.createPlan(dto);
  }

  @Patch('plans/:id')
  updatePlan(@Param('id') id: string, @Body() dto: UpsertPlanDto) {
    return this.admin.updatePlan(id, dto);
  }

  @Get('settings')
  getSettings() {
    return this.admin.getSettings();
  }

  @Put('settings')
  updateSettings(@Body() dto: UpdateSettingsDto) {
    return this.admin.updateSettings(dto);
  }

  @Patch('organisations/:id')
  patchOrg(@Param('id') id: string, @Body() dto: PatchOrganisationDto) {
    return this.admin.patchOrganisation(id, dto);
  }

  @Put('organisations/:id/subscription')
  assignSub(@Param('id') id: string, @Body() dto: AssignSubscriptionDto) {
    return this.admin.assignSubscription(id, dto);
  }

  @Get('revenue/platform-fees')
  platformFees() {
    return this.admin.listPlatformFees();
  }

  @Get('revenue/subscriptions')
  subscriptions() {
    return this.admin.listSubscriptionInvoices();
  }

  @Patch('payments/platform-invoices/:id')
  reviewInvoice(
    @Param('id') id: string,
    @Body() body: { action: 'approve' | 'reject'; reason?: string },
  ) {
    return this.admin.reviewPlatformInvoice(id, body.action, body.reason);
  }
}
