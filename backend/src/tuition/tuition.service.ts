import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  TuitionInvoiceStatus,
  TuitionPaymentMethod,
  TuitionPaymentStatus,
} from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTuitionFeePlanDto,
  CreateTuitionInvoiceDto,
  RecordCashPaymentDto,
  RecordTuitionSlipDto,
  ReviewTuitionSlipDto,
  StudentTuitionSlipDto,
} from './dto/tuition.dto';

@Injectable()
export class TuitionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  listFeePlans(organisationId: string) {
    return this.prisma.tuitionFeePlan.findMany({
      where: { organisationId, active: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  createFeePlan(dto: CreateTuitionFeePlanDto) {
    return this.prisma.tuitionFeePlan.create({
      data: {
        organisationId: dto.organisationId,
        name: dto.name.trim(),
        amountLkr: dto.amountLkr,
      },
    });
  }

  async listInvoices(organisationId: string, enrollmentId?: string) {
    const rows = await this.prisma.tuitionInvoice.findMany({
      where: {
        organisationId,
        ...(enrollmentId ? { enrollmentId } : {}),
      },
      include: {
        enrollment: { select: { id: true, displayName: true, studentUserId: true } },
        feePlan: { select: { id: true, name: true } },
        payments: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((inv) => this.mapInvoice(inv));
  }

  async createInvoice(dto: CreateTuitionInvoiceDto) {
    const enrollment = await this.prisma.instituteEnrollment.findFirst({
      where: { id: dto.enrollmentId, organisationId: dto.organisationId },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    let amountLkr = dto.amountLkr;
    let title = dto.title?.trim();
    let feePlanId = dto.feePlanId ?? null;

    if (feePlanId) {
      const plan = await this.prisma.tuitionFeePlan.findFirst({
        where: { id: feePlanId, organisationId: dto.organisationId, active: true },
      });
      if (!plan) throw new NotFoundException('Tuition fee plan not found');
      amountLkr = amountLkr ?? plan.amountLkr;
      title = title || plan.name;
    }

    if (!amountLkr || amountLkr < 1) {
      throw new BadRequestException('amountLkr or feePlanId required');
    }
    if (!title) title = 'Class fees';

    const invoice = await this.prisma.tuitionInvoice.create({
      data: {
        organisationId: dto.organisationId,
        enrollmentId: enrollment.id,
        feePlanId,
        title,
        amountLkr,
        status: TuitionInvoiceStatus.OPEN,
      },
      include: {
        enrollment: { select: { id: true, displayName: true, studentUserId: true } },
        feePlan: { select: { id: true, name: true } },
        payments: true,
      },
    });

    if (enrollment.studentUserId) {
      const student = await this.prisma.user.findUnique({
        where: { id: enrollment.studentUserId },
        select: { email: true, name: true },
      });
      if (student) {
        void this.mail.tuitionInvoice(
          student.email,
          student.name,
          title!,
          amountLkr!,
        );
      }
    }

    return this.mapInvoice(invoice);
  }

  async recordCash(
    invoiceId: string,
    userId: string,
    dto: RecordCashPaymentDto,
  ) {
    const invoice = await this.requireOpenInvoice(invoiceId, dto.organisationId);
    const amountLkr = dto.amountLkr ?? this.remaining(invoice);
    if (amountLkr < 1) throw new BadRequestException('Invoice already paid');

    const payment = await this.prisma.tuitionPayment.create({
      data: {
        organisationId: dto.organisationId,
        invoiceId: invoice.id,
        method: TuitionPaymentMethod.CASH,
        amountLkr,
        status: TuitionPaymentStatus.APPROVED,
        note: dto.note,
        recordedByUserId: userId,
        reviewedByUserId: userId,
        reviewedAt: new Date(),
      },
    });

    await this.applyApprovedPayment(invoice.id, amountLkr);
    return payment;
  }

  async recordSlip(
    invoiceId: string,
    userId: string,
    dto: RecordTuitionSlipDto,
  ) {
    const invoice = await this.requireOpenInvoice(invoiceId, dto.organisationId);
    const amountLkr = dto.amountLkr ?? this.remaining(invoice);
    if (amountLkr < 1) throw new BadRequestException('Invoice already paid');

    return this.prisma.tuitionPayment.create({
      data: {
        organisationId: dto.organisationId,
        invoiceId: invoice.id,
        method: TuitionPaymentMethod.BANK_SLIP,
        amountLkr,
        status: TuitionPaymentStatus.PENDING,
        slipReference: dto.slipReference.trim(),
        note: dto.note,
        recordedByUserId: userId,
      },
    });
  }

  async reviewSlip(
    paymentId: string,
    userId: string,
    dto: ReviewTuitionSlipDto,
  ) {
    const payment = await this.prisma.tuitionPayment.findFirst({
      where: {
        id: paymentId,
        organisationId: dto.organisationId,
        method: TuitionPaymentMethod.BANK_SLIP,
      },
    });
    if (!payment) throw new NotFoundException('Tuition slip not found');
    if (payment.status !== TuitionPaymentStatus.PENDING) {
      throw new BadRequestException('Slip already reviewed');
    }

    if (dto.decision === 'reject') {
      return this.prisma.tuitionPayment.update({
        where: { id: payment.id },
        data: {
          status: TuitionPaymentStatus.REJECTED,
          rejectionReason: dto.rejectionReason ?? 'Rejected',
          reviewedByUserId: userId,
          reviewedAt: new Date(),
        },
      });
    }

    const updated = await this.prisma.tuitionPayment.update({
      where: { id: payment.id },
      data: {
        status: TuitionPaymentStatus.APPROVED,
        reviewedByUserId: userId,
        reviewedAt: new Date(),
      },
    });
    await this.applyApprovedPayment(payment.invoiceId, payment.amountLkr);
    return updated;
  }

  async studentBalance(studentUserId: string) {
    const invoices = await this.prisma.tuitionInvoice.findMany({
      where: {
        enrollment: { studentUserId },
        status: { in: [TuitionInvoiceStatus.OPEN, TuitionInvoiceStatus.PAID] },
      },
      include: {
        enrollment: { select: { id: true, displayName: true, studentUserId: true } },
        feePlan: { select: { id: true, name: true } },
        payments: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
    const mapped = invoices.map((inv) => this.mapInvoice(inv));
    const outstandingLkr = mapped
      .filter((i) => i.status === 'OPEN')
      .reduce((sum, i) => sum + i.remainingLkr, 0);
    return { outstandingLkr, invoices: mapped };
  }

  async studentUploadSlip(studentUserId: string, dto: StudentTuitionSlipDto) {
    const invoice = await this.prisma.tuitionInvoice.findFirst({
      where: {
        id: dto.invoiceId,
        enrollment: { studentUserId },
        status: TuitionInvoiceStatus.OPEN,
      },
    });
    if (!invoice) throw new NotFoundException('Tuition invoice not found');

    const amountLkr = dto.amountLkr ?? this.remaining(invoice);
    if (amountLkr < 1) throw new BadRequestException('Invoice already paid');

    return this.prisma.tuitionPayment.create({
      data: {
        organisationId: invoice.organisationId,
        invoiceId: invoice.id,
        method: TuitionPaymentMethod.BANK_SLIP,
        amountLkr,
        status: TuitionPaymentStatus.PENDING,
        slipReference: dto.slipReference.trim(),
        note: dto.note,
        recordedByUserId: studentUserId,
      },
    });
  }

  private remaining(invoice: { amountLkr: number; paidAmountLkr: number }) {
    return Math.max(0, invoice.amountLkr - invoice.paidAmountLkr);
  }

  private async requireOpenInvoice(id: string, organisationId: string) {
    const invoice = await this.prisma.tuitionInvoice.findFirst({
      where: { id, organisationId },
    });
    if (!invoice) throw new NotFoundException('Tuition invoice not found');
    if (invoice.status === TuitionInvoiceStatus.CANCELLED) {
      throw new BadRequestException('Invoice cancelled');
    }
    if (invoice.status === TuitionInvoiceStatus.PAID) {
      throw new BadRequestException('Invoice already paid');
    }
    return invoice;
  }

  private async applyApprovedPayment(invoiceId: string, amountLkr: number) {
    const invoice = await this.prisma.tuitionInvoice.findUniqueOrThrow({
      where: { id: invoiceId },
    });
    const paidAmountLkr = invoice.paidAmountLkr + amountLkr;
    const status =
      paidAmountLkr >= invoice.amountLkr
        ? TuitionInvoiceStatus.PAID
        : TuitionInvoiceStatus.OPEN;
    await this.prisma.tuitionInvoice.update({
      where: { id: invoiceId },
      data: { paidAmountLkr, status },
    });
  }

  private mapInvoice(inv: {
    id: string;
    organisationId: string;
    enrollmentId: string;
    title: string;
    amountLkr: number;
    paidAmountLkr: number;
    status: TuitionInvoiceStatus;
    dueAt: Date | null;
    createdAt: Date;
    enrollment: { id: string; displayName: string; studentUserId: string | null };
    feePlan: { id: string; name: string } | null;
    payments: Array<{
      id: string;
      method: TuitionPaymentMethod;
      amountLkr: number;
      status: TuitionPaymentStatus;
      slipReference: string | null;
      createdAt: Date;
    }>;
  }) {
    return {
      id: inv.id,
      organisationId: inv.organisationId,
      enrollmentId: inv.enrollmentId,
      title: inv.title,
      amountLkr: inv.amountLkr,
      paidAmountLkr: inv.paidAmountLkr,
      remainingLkr: this.remaining(inv),
      status: inv.status,
      dueAt: inv.dueAt?.toISOString() ?? null,
      createdAt: inv.createdAt.toISOString(),
      enrollment: inv.enrollment,
      feePlan: inv.feePlan,
      payments: inv.payments.map((p) => ({
        id: p.id,
        method: p.method,
        amountLkr: p.amountLkr,
        status: p.status,
        slipReference: p.slipReference,
        createdAt: p.createdAt.toISOString(),
      })),
    };
  }

}
