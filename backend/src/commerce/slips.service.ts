import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CommerceOrderStatus,
  FeeLineStatus,
  SlipStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutService } from './checkout.service';
import { CommissionService } from './commission.service';
import { ReviewSlipDto, SlipReviewAction, UploadSlipDto } from './dto/commerce.dto';

@Injectable()
export class SlipsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly checkout: CheckoutService,
    private readonly commission: CommissionService,
  ) {}

  async upload(studentUserId: string, dto: UploadSlipDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.studentUserId !== studentUserId) {
      throw new ForbiddenException('Not your order');
    }
    if (
      order.status !== CommerceOrderStatus.AWAITING_SLIP &&
      order.status !== CommerceOrderStatus.REJECTED
    ) {
      throw new BadRequestException(
        'Slip can only be uploaded while awaiting review or after rejection',
      );
    }

    const slip = await this.prisma.$transaction(async (tx) => {
      await tx.paymentSlip.updateMany({
        where: {
          orderId: order.id,
          status: SlipStatus.PENDING,
        },
        data: { status: SlipStatus.REJECTED, rejectionReason: 'Superseded' },
      });

      const created = await tx.paymentSlip.create({
        data: {
          orderId: order.id,
          organisationId: order.organisationId,
          uploadedByUserId: studentUserId,
          slipReference: dto.slipReference,
          note: dto.note,
          status: SlipStatus.PENDING,
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: { status: CommerceOrderStatus.UNDER_REVIEW },
      });

      return created;
    });

    return this.mapSlip(slip);
  }

  async listPending(organisationId: string) {
    const slips = await this.prisma.paymentSlip.findMany({
      where: { organisationId, status: SlipStatus.PENDING },
      include: {
        order: {
          include: { lines: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return slips.map((s) => ({
      ...this.mapSlip(s),
      order: {
        id: s.order.id,
        totalLkr: s.order.totalLkr,
        subtotalLkr: s.order.subtotalLkr,
        commissionPercentSnapshot: Number(s.order.commissionPercentSnapshot),
        buyer: {
          name: s.order.buyerName,
          email: s.order.buyerEmail,
          phone: s.order.buyerPhone,
        },
        status: s.order.status,
      },
    }));
  }

  async review(
    slipId: string,
    organisationId: string,
    reviewerUserId: string,
    dto: ReviewSlipDto,
  ) {
    const slip = await this.prisma.paymentSlip.findUnique({
      where: { id: slipId },
      include: { order: true },
    });
    if (!slip) throw new NotFoundException('Slip not found');
    if (slip.organisationId !== organisationId) {
      throw new ForbiddenException('Not your organisation slip');
    }
    if (slip.status !== SlipStatus.PENDING) {
      throw new BadRequestException('Slip already reviewed');
    }

    if (dto.action === SlipReviewAction.REJECT) {
      if (!dto.reason?.trim()) {
        throw new BadRequestException('Rejection reason is required');
      }
      const updated = await this.prisma.$transaction(async (tx) => {
        const s = await tx.paymentSlip.update({
          where: { id: slipId },
          data: {
            status: SlipStatus.REJECTED,
            rejectionReason: dto.reason,
            reviewedAt: new Date(),
            reviewedByUserId: reviewerUserId,
          },
        });
        await tx.order.update({
          where: { id: slip.orderId },
          data: { status: CommerceOrderStatus.REJECTED },
        });
        return s;
      });
      return this.mapSlip(updated);
    }

    // APPROVE — transactional: paid + tickets + fee line + inventory
    const result = await this.prisma.$transaction(async (tx) => {
      const s = await tx.paymentSlip.update({
        where: { id: slipId },
        data: {
          status: SlipStatus.APPROVED,
          reviewedAt: new Date(),
          reviewedByUserId: reviewerUserId,
        },
      });

      await tx.order.update({
        where: { id: slip.orderId },
        data: { status: CommerceOrderStatus.PAID },
      });

      await this.checkout.issuePendingTickets(tx, slip.orderId);

      const feeAmount = this.commission.feeAmountLkr(
        slip.order.subtotalLkr,
        slip.order.commissionPercentSnapshot,
      );

      await tx.platformFeeLine.create({
        data: {
          orderId: slip.orderId,
          organisationId: slip.organisationId,
          commissionPercent: slip.order.commissionPercentSnapshot,
          ticketSubtotalLkr: slip.order.subtotalLkr,
          feeAmountLkr: feeAmount,
          status: FeeLineStatus.ACTIVE,
        },
      });

      return { slip: s, feeAmount };
    });

    return {
      ...this.mapSlip(result.slip),
      platformFeeAmountLkr: result.feeAmount,
    };
  }

  private mapSlip(s: {
    id: string;
    orderId: string;
    organisationId: string;
    status: SlipStatus;
    slipReference: string;
    note: string | null;
    rejectionReason: string | null;
    reviewedAt: Date | null;
    createdAt: Date;
  }) {
    return {
      id: s.id,
      orderId: s.orderId,
      organisationId: s.organisationId,
      status: s.status,
      slipReference: s.slipReference,
      note: s.note,
      rejectionReason: s.rejectionReason,
      reviewedAt: s.reviewedAt?.toISOString() ?? null,
      createdAt: s.createdAt.toISOString(),
    };
  }
}
