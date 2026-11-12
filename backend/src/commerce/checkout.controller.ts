import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CurrentUser,
  type AuthUser,
} from '../common/decorators/current-user.decorator';
import { CheckoutService } from './checkout.service';
import { CheckoutDto } from './dto/commerce.dto';
import { SeatHoldDto } from './dto/seats.dto';
import { SeatsService } from './seats.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class CheckoutController {
  constructor(
    private readonly checkout: CheckoutService,
    private readonly seats: SeatsService,
  ) {}

  @Post('checkout')
  @HttpCode(201)
  create(@CurrentUser() user: AuthUser, @Body() dto: CheckoutDto) {
    return this.checkout.checkout(user.userId, dto);
  }

  @Post('checkout/seat-holds')
  @HttpCode(201)
  seatHolds(@CurrentUser() user: AuthUser, @Body() dto: SeatHoldDto) {
    return this.seats.createHolds(user.userId, dto);
  }

  @Get('checkout/:orderId/bank-instructions')
  bankInstructions(
    @CurrentUser() user: AuthUser,
    @Param('orderId') orderId: string,
  ) {
    return this.checkout.bankInstructions(orderId, user.userId);
  }

  @Get('orders')
  listOrders(@CurrentUser() user: AuthUser) {
    return this.checkout.listOrdersForStudent(user.userId);
  }

  @Get('orders/:id')
  getOrder(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.checkout.getOrder(id, user.userId, user.isPlatformAdmin);
  }

  @Get('tickets')
  listTickets(@CurrentUser() user: AuthUser) {
    return this.checkout.listTicketsForStudent(user.userId);
  }

  @Get('tickets/:id')
  getTicket(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.checkout.getTicket(id, user.userId, user.isPlatformAdmin);
  }

  /** PayHere held — always 501 until Phase F. */
  @Post('payments/payhere')
  @HttpCode(501)
  payhereStub() {
    return {
      statusCode: 501,
      message: 'PayHere is disabled (PAYHERE_ENABLED=false)',
    };
  }
}
