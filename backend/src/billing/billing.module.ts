import { Module } from '@nestjs/common';
import { EntitlementGuard } from '../common/guards/entitlement.guard';
import { AdminBillingService } from './admin-billing.service';
import { AdminController } from './admin.controller';
import { InstituteBillingController } from './institute-billing.controller';
import { InstituteBillingService } from './institute-billing.service';
import { PlanLimitService } from './plan-limit.service';

@Module({
  controllers: [AdminController, InstituteBillingController],
  providers: [
    PlanLimitService,
    AdminBillingService,
    InstituteBillingService,
    EntitlementGuard,
  ],
  exports: [PlanLimitService, AdminBillingService, InstituteBillingService],
})
export class BillingModule {}
