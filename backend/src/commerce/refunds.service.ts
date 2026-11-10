import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CommerceOrderStatus,
  FeeLineStatus,
  RefundStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutService } from './checkout.service';
import { CreateRefundDto, ReviewRefundDto, SlipReviewAction } from './dto/commerce.dto';

@Injectable()
export class RefundsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly checkout: CheckoutService,
  ) {}

  async request(studentUserId: string, dto: CreateRefundDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.studentUserId !== studentUserId) {
      throw new ForbiddenException('Not your order');
    }
    if (order.status !== CommerceOrderStatus.PAID) {
      throw new BadRequestException('Only paid orders can be refunded');
    }
    const existing = await this.prisma.refundRequest.findFirst({
      where: { orderId: order.id, status: RefundStatus.OPEN },
    });
    if (existing) {
      throw new BadRequestException('A refund request is already open');
    }

    const refund = await this.prisma.refundRequest.create({
      data: {
        orderId: order.id,
        studentUserId,
        reason: dto.reason,
        amountLkr: order.totalLkr,
        status: RefundStatus.OPEN,
      },
    });
    return this.map(refund);
  }

  async review(
    refundId: string,
    organisationId: string,
    dto: ReviewRefundDto,
  ) {
    const refund = await this.prisma.refundRequest.findUnique({
      where: { id: refundId },
      include: { order: true },
    });
    if (!refund) throw new NotFoundException('Refund not found');
    if (refund.order.organisationId !== organisationId) {
      throw new ForbiddenException('Not your organisation refund');
    }
    if (refund.status !== RefundStatus.OPEN) {
      throw new BadRequestException('Refund already reviewed');
    }

    if (dto.action === SlipReviewAction.REJECT) {
      const updated = await this.prisma.refundRequest.update({
        where: { id: refundId },
        data: { status: RefundStatus.REJECTED },
      });
      return this.map(updated);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const r = await tx.refundRequest.update({
        where: { id: refundId },
        data: { status: RefundStatus.APPROVED },
      });
      await tx.order.update({
        where: { id: refund.orderId },
        data: { status: CommerceOrderStatus.REFUNDED },
      });
      await this.checkout.voidTicketsForOrder(tx, refund.orderId);
      await tx.platformFeeLine.updateMany({
        where: { orderId: refund.orderId, status: FeeLineStatus.ACTIVE },
        data: { status: FeeLineStatus.VOID },
      });
      return r;
    });
    return this.map(updated);
  }

  private map(r: {
    id: string;
    orderId: string;
    studentUserId: string;
    reason: string;
    amountLkr: number;
    status: RefundStatus;
    createdAt: Date;
  }) {
    return {
      id: r.id,
      orderId: r.orderId,
      studentUserId: r.studentUserId,
      reason: r.reason,
      amountLkr: r.amountLkr,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    };
  }
}
