import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CurrentUser,
  type AuthUser,
} from '../common/decorators/current-user.decorator';
import { CreateRefundDto, UploadSlipDto } from './dto/commerce.dto';
import { RefundsService } from './refunds.service';
import { SlipsService } from './slips.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(
    private readonly slips: SlipsService,
    private readonly refunds: RefundsService,
  ) {}

  @Post('payments/slips')
  @HttpCode(201)
  uploadSlip(@CurrentUser() user: AuthUser, @Body() dto: UploadSlipDto) {
    return this.slips.upload(user.userId, dto);
  }

  @Post('refunds')
  @HttpCode(201)
  requestRefund(@CurrentUser() user: AuthUser, @Body() dto: CreateRefundDto) {
    return this.refunds.request(user.userId, dto);
  }
}
