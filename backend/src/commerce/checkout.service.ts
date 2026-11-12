import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CommerceOrderStatus,
  CommercePaymentMethod,
  Prisma,
  SeminarStatus,
  TicketLifecycle,
} from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CommissionService } from './commission.service';
import { CheckoutDto } from './dto/commerce.dto';

function mapOrder(order: {
  id: string;
  studentUserId: string;
  organisationId: string;
  status: CommerceOrderStatus;
  paymentMethod: CommercePaymentMethod;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  subtotalLkr: number;
  bookingFeeLkr: number;
  totalLkr: number;
  commissionPercentSnapshot: Prisma.Decimal;
  createdAt: Date;
  updatedAt: Date;
  lines?: {
    id: string;
    seminarId: string;
    ticketTypeId: string;
    quantity: number;
    unitPriceLkr: number;
    attendeeNames: string[];
  }[];
}) {
  return {
    id: order.id,
    studentUserId: order.studentUserId,
    organisationId: order.organisationId,
    status: order.status,
    paymentMethod: order.paymentMethod,
    buyer: {
      name: order.buyerName,
      email: order.buyerEmail,
      phone: order.buyerPhone,
    },
    subtotalLkr: order.subtotalLkr,
    bookingFeeLkr: order.bookingFeeLkr,
    totalLkr: order.totalLkr,
    commissionPercentSnapshot: Number(order.commissionPercentSnapshot),
    lines: (order.lines ?? []).map((l) => ({
      id: l.id,
      seminarId: l.seminarId,
      ticketTypeId: l.ticketTypeId,
      quantity: l.quantity,
      unitPriceLkr: l.unitPriceLkr,
      attendeeNames: l.attendeeNames,
    })),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

@Injectable()
export class CheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commission: CommissionService,
  ) {}

  async checkout(studentUserId: string, dto: CheckoutDto) {
    const method = dto.paymentMethod ?? CommercePaymentMethod.BANK_TRANSFER;
    if (method !== CommercePaymentMethod.BANK_TRANSFER) {
      throw new BadRequestException(
        'Only bank_transfer is enabled; card/PayHere is disabled',
      );
    }

    const ticketTypeIds = dto.lines.map((l) => l.ticketTypeId);
    const types = await this.prisma.ticketType.findMany({
      where: { id: { in: ticketTypeIds } },
      include: { seminar: true },
    });
    if (types.length !== new Set(ticketTypeIds).size) {
      throw new BadRequestException('One or more ticket types were not found');
    }

    const byId = new Map(types.map((t) => [t.id, t]));
    let organisationId: string | null = null;
    let subtotal = 0;
    const resolved: {
      ticketTypeId: string;
      seminarId: string;
      quantity: number;
      unitPriceLkr: number;
      attendeeNames: string[];
      available: number;
    }[] = [];

    for (const line of dto.lines) {
      const tt = byId.get(line.ticketTypeId);
      if (!tt) throw new BadRequestException('Ticket type not found');
      if (tt.seminar.status !== SeminarStatus.PUBLISHED) {
        throw new BadRequestException(`Seminar ${tt.seminar.slug} is not on sale`);
      }
      if (organisationId && organisationId !== tt.seminar.organisationId) {
        throw new BadRequestException(
          'Cart may only contain seminars from one organiser',
        );
      }
      organisationId = tt.seminar.organisationId;
      const available = tt.capacity - tt.sold;
      if (line.quantity > available) {
        throw new BadRequestException(
          `Not enough seats for ${tt.name} (available ${available})`,
        );
      }
      subtotal += tt.priceLkr * line.quantity;
      resolved.push({
        ticketTypeId: tt.id,
        seminarId: tt.seminarId,
        quantity: line.quantity,
        unitPriceLkr: tt.priceLkr,
        attendeeNames: line.attendeeNames ?? [],
        available,
      });
    }

    if (!organisationId) {
      throw new BadRequestException('Empty cart');
    }

    const percent = await this.commission.resolvePercentForOrganisation(
      organisationId,
    );
    const bookingFeeLkr = 0;
    const totalLkr = subtotal + bookingFeeLkr;

    const order = await this.prisma.$transaction(async (tx) => {
      // Re-check capacity inside transaction
      for (const line of resolved) {
        const fresh = await tx.ticketType.findUniqueOrThrow({
          where: { id: line.ticketTypeId },
        });
        if (fresh.capacity - fresh.sold < line.quantity) {
          throw new BadRequestException('Inventory changed; retry checkout');
        }
      }

      return tx.order.create({
        data: {
          studentUserId,
          organisationId: organisationId!,
          status: CommerceOrderStatus.AWAITING_SLIP,
          paymentMethod: CommercePaymentMethod.BANK_TRANSFER,
          buyerName: dto.buyer.name,
          buyerEmail: dto.buyer.email,
          buyerPhone: dto.buyer.phone,
          subtotalLkr: subtotal,
          bookingFeeLkr,
          totalLkr,
          commissionPercentSnapshot: percent,
          lines: {
            create: resolved.map((l) => ({
              seminarId: l.seminarId,
              ticketTypeId: l.ticketTypeId,
              quantity: l.quantity,
              unitPriceLkr: l.unitPriceLkr,
              attendeeNames: l.attendeeNames,
            })),
          },
        },
        include: { lines: true },
      });
    });

    return mapOrder(order);
  }

  async bankInstructions(orderId: string, studentUserId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { organisation: { include: { bankAccounts: true } } },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.studentUserId !== studentUserId) {
      throw new ForbiddenException('Not your order');
    }

    const account =
      order.organisation.bankAccounts[0] ??
      (await this.prisma.bankAccount.findFirst({
        where: { isPlatform: false, organisationId: order.organisationId },
      }));

    return {
      orderId: order.id,
      status: order.status,
      totalLkr: order.totalLkr,
      commissionPercentSnapshot: Number(order.commissionPercentSnapshot),
      organisation: {
        id: order.organisation.id,
        name: order.organisation.name,
        slug: order.organisation.slug,
      },
      bankAccount: account
        ? {
            bankName: account.bankName,
            accountName: account.accountName,
            accountNumber: account.accountNumber,
            branch: account.branch,
          }
        : null,
      message: account
        ? `Transfer LKR ${order.totalLkr} and upload your slip.`
        : 'Seller has not published bank details yet — contact the organiser.',
    };
  }

  async listOrdersForStudent(studentUserId: string) {
    const rows = await this.prisma.order.findMany({
      where: { studentUserId },
      include: { lines: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(mapOrder);
  }

  async listOrdersForOrganisation(organisationId: string) {
    const rows = await this.prisma.order.findMany({
      where: { organisationId },
      include: { lines: true },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    return rows.map(mapOrder);
  }

  async getOrder(orderId: string, studentUserId: string, isAdmin = false) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { lines: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (!isAdmin && order.studentUserId !== studentUserId) {
      throw new ForbiddenException('Not your order');
    }
    return mapOrder(order);
  }

  async listTicketsForStudent(studentUserId: string) {
    const rows = await this.prisma.ticket.findMany({
      where: { studentUserId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(this.mapTicket);
  }

  async getTicket(ticketId: string, studentUserId: string, isAdmin = false) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (!isAdmin && ticket.studentUserId !== studentUserId) {
      throw new ForbiddenException('Not your ticket');
    }
    return this.mapTicket(ticket);
  }

  /** Used by SlipService after approve. */
  async issuePendingTickets(
    tx: Prisma.TransactionClient,
    orderId: string,
  ): Promise<void> {
    const order = await tx.order.findUniqueOrThrow({
      where: { id: orderId },
      include: { lines: true },
    });
    for (const line of order.lines) {
      for (let i = 0; i < line.quantity; i += 1) {
        const holder =
          line.attendeeNames[i]?.trim() || order.buyerName;
        await tx.ticket.create({
          data: {
            code: this.ticketCode(),
            orderId: order.id,
            orderLineId: line.id,
            studentUserId: order.studentUserId,
            seminarId: line.seminarId,
            ticketTypeId: line.ticketTypeId,
            organisationId: order.organisationId,
            holderName: holder,
            status: TicketLifecycle.VALID,
          },
        });
      }
      await tx.ticketType.update({
        where: { id: line.ticketTypeId },
        data: { sold: { increment: line.quantity } },
      });
    }
  }

  async voidTicketsForOrder(
    tx: Prisma.TransactionClient,
    orderId: string,
  ): Promise<void> {
    const tickets = await tx.ticket.findMany({
      where: {
        orderId,
        status: { in: [TicketLifecycle.VALID, TicketLifecycle.PENDING] },
      },
    });
    if (!tickets.length) return;

    const byType = new Map<string, number>();
    for (const t of tickets) {
      byType.set(t.ticketTypeId, (byType.get(t.ticketTypeId) ?? 0) + 1);
    }
    await tx.ticket.updateMany({
      where: { id: { in: tickets.map((t) => t.id) } },
      data: { status: TicketLifecycle.VOID },
    });
    for (const [ticketTypeId, count] of byType) {
      await tx.ticketType.update({
        where: { id: ticketTypeId },
        data: { sold: { decrement: count } },
      });
    }
  }

  private ticketCode(): string {
    return `EDP-${randomBytes(5).toString('hex').toUpperCase()}`;
  }

  private mapTicket(t: {
    id: string;
    code: string;
    orderId: string;
    studentUserId: string;
    seminarId: string;
    ticketTypeId: string;
    organisationId: string;
    holderName: string;
    status: TicketLifecycle;
    checkedInAt: Date | null;
    createdAt: Date;
  }) {
    return {
      id: t.id,
      code: t.code,
      orderId: t.orderId,
      studentUserId: t.studentUserId,
      seminarId: t.seminarId,
      ticketTypeId: t.ticketTypeId,
      organisationId: t.organisationId,
      holderName: t.holderName,
      status: t.status,
      checkedInAt: t.checkedInAt?.toISOString() ?? null,
      createdAt: t.createdAt.toISOString(),
    };
  }
}
