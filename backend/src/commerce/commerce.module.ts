import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { CommissionService } from './commission.service';
import { OrganiserPaymentsController } from './organiser-payments.controller';
import { PaymentsController } from './payments.controller';
import { RefundsService } from './refunds.service';
import { SlipsService } from './slips.service';

@Module({
  controllers: [
    CheckoutController,
    PaymentsController,
    OrganiserPaymentsController,
  ],
  providers: [
    CommissionService,
    CheckoutService,
    SlipsService,
    RefundsService,
  ],
  exports: [CommissionService, CheckoutService, SlipsService, RefundsService],
})
export class CommerceModule {}
