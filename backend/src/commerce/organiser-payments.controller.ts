import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CurrentUser,
  type AuthUser,
} from '../common/decorators/current-user.decorator';
import { OrgScopeGuard } from '../common/guards/org-scope.guard';
import { ReviewRefundDto, ReviewSlipDto } from './dto/commerce.dto';
import { RefundsService } from './refunds.service';
import { SlipsService } from './slips.service';

@Controller('organiser')
@UseGuards(JwtAuthGuard, OrgScopeGuard)
export class OrganiserPaymentsController {
  constructor(
    private readonly slips: SlipsService,
    private readonly refunds: RefundsService,
  ) {}

  @Get('payments/pending-slips')
  pending(@Query('organisationId') organisationId: string) {
    return this.slips.listPending(organisationId);
  }

  @Patch('payments/slips/:id')
  reviewSlip(
    @Param('id') id: string,
    @Query('organisationId') organisationId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: ReviewSlipDto,
  ) {
    return this.slips.review(id, organisationId, user.userId, dto);
  }

  @Patch('refunds/:id')
  reviewRefund(
    @Param('id') id: string,
    @Query('organisationId') organisationId: string,
    @Body() dto: ReviewRefundDto,
  ) {
    return this.refunds.review(id, organisationId, dto);
  }
}
