import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import {
  CheckInMode,
  ExamLevel,
  SeminarMode,
  SeminarStatus,
} from '@prisma/client';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Bank checkout → slip → tickets (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    prisma = app.get(PrismaService);

    await prisma.platformSettings.upsert({
      where: { id: 'default' },
      update: { ticketCommissionPercent: 5, payhereEnabled: false },
      create: {
        id: 'default',
        ticketCommissionPercent: 5,
        payhereEnabled: false,
      },
    });
    await prisma.subscriptionPlan.upsert({
      where: { code: 'free' },
      update: {},
      create: {
        code: 'free',
        name: 'Free',
        priceLkr: 0,
        maxBatches: 2,
        maxStudents: 50,
        maxStaff: 5,
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  async function registerStudent() {
    const email = `stu-${Date.now()}@test.lk`;
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register/student',
      payload: {
        email,
        password: 'Password123!',
        name: 'Student Buyer',
      },
    });
    expect(res.statusCode).toBe(201);
    return JSON.parse(res.payload) as { accessToken: string };
  }

  async function registerSellerWithSeminar() {
    const email = `sell-${Date.now()}@test.lk`;
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register/lecturer',
      payload: {
        email,
        password: 'Password123!',
        name: 'Seller',
        organisationName: `Seller ${Date.now()}`,
      },
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload) as {
      accessToken: string;
      user: { memberships: { organisationId: string }[] };
    };
    const organisationId = body.user.memberships[0].organisationId;

    const bankPut = await app.inject({
      method: 'PUT',
      url: `/api/organisations/${organisationId}/bank-account`,
      headers: { authorization: `Bearer ${body.accessToken}` },
      payload: {
        bankName: 'Test Bank',
        accountName: 'Seller',
        accountNumber: '111222333',
        branch: 'Colombo',
      },
    });
    expect(bankPut.statusCode).toBe(200);

    const starts = new Date();
    starts.setDate(starts.getDate() + 30);
    const create = await app.inject({
      method: 'POST',
      url: '/api/organiser/seminars',
      headers: { authorization: `Bearer ${body.accessToken}` },
      payload: {
        organisationId,
        title: 'Commerce E2E Seminar Title',
        subject: 'Economics',
        level: ExamLevel.AL,
        mode: SeminarMode.PHYSICAL,
        venue: 'Hall',
        district: 'Colombo',
        startsAt: starts.toISOString(),
        durationHours: 3,
        summary: 'Summary long enough for the commerce e2e seminar.',
        description: 'Description',
        ticketTypes: [
          {
            name: 'Standard',
            description: 'Seat',
            priceLkr: 2000,
            capacity: 20,
          },
        ],
      },
    });
    expect(create.statusCode).toBe(201);
    const seminar = JSON.parse(create.payload) as {
      id: string;
      ticketTypes: { id: string }[];
    };

    const publish = await app.inject({
      method: 'POST',
      url: `/api/organiser/seminars/${seminar.id}/publish?organisationId=${organisationId}`,
      headers: { authorization: `Bearer ${body.accessToken}` },
      payload: { checkInMode: CheckInMode.QR_GATE },
    });
    expect(publish.statusCode).toBe(201);

    return {
      token: body.accessToken,
      organisationId,
      ticketTypeId: seminar.ticketTypes[0].id,
      seminarId: seminar.id,
    };
  }

  it('rejects card checkout', async () => {
    const student = await registerStudent();
    const seller = await registerSellerWithSeminar();
    const res = await app.inject({
      method: 'POST',
      url: '/api/checkout',
      headers: { authorization: `Bearer ${student.accessToken}` },
      payload: {
        paymentMethod: 'CARD',
        buyer: {
          name: 'Buyer',
          email: 'buyer@test.lk',
          phone: '0771234567',
        },
        lines: [{ ticketTypeId: seller.ticketTypeId, quantity: 1 }],
      },
    });
    expect(res.statusCode).toBe(400);
  });

  it('snapshots commission, approves slip, issues tickets + fee line', async () => {
    // Re-assert platform rate — other e2e files share the DB and may mutate settings.
    await prisma.platformSettings.upsert({
      where: { id: 'default' },
      update: { ticketCommissionPercent: 5, payhereEnabled: false },
      create: {
        id: 'default',
        ticketCommissionPercent: 5,
        payhereEnabled: false,
      },
    });
    const student = await registerStudent();
    const seller = await registerSellerWithSeminar();

    const checkout = await app.inject({
      method: 'POST',
      url: '/api/checkout',
      headers: { authorization: `Bearer ${student.accessToken}` },
      payload: {
        paymentMethod: 'BANK_TRANSFER',
        buyer: {
          name: 'Buyer',
          email: 'buyer@test.lk',
          phone: '0771234567',
        },
        lines: [{ ticketTypeId: seller.ticketTypeId, quantity: 2 }],
      },
    });
    expect(checkout.statusCode).toBe(201);
    const order = JSON.parse(checkout.payload) as {
      id: string;
      status: string;
      subtotalLkr: number;
      commissionPercentSnapshot: number;
    };
    expect(order.status).toBe('AWAITING_SLIP');
    expect(order.subtotalLkr).toBe(4000);
    expect(order.commissionPercentSnapshot).toBe(5);

    const orgOrders = await app.inject({
      method: 'GET',
      url: `/api/organiser/orders?organisationId=${seller.organisationId}`,
      headers: { authorization: `Bearer ${seller.token}` },
    });
    expect(orgOrders.statusCode).toBe(200);
    const listed = JSON.parse(orgOrders.payload) as { id: string }[];
    expect(listed.some((o) => o.id === order.id)).toBe(true);

    const instructions = await app.inject({
      method: 'GET',
      url: `/api/checkout/${order.id}/bank-instructions`,
      headers: { authorization: `Bearer ${student.accessToken}` },
    });
    expect(instructions.statusCode).toBe(200);
    const bank = JSON.parse(instructions.payload) as {
      bankAccount: { accountNumber: string } | null;
    };
    expect(bank.bankAccount?.accountNumber).toBe('111222333');

    const slip = await app.inject({
      method: 'POST',
      url: '/api/payments/slips',
      headers: { authorization: `Bearer ${student.accessToken}` },
      payload: {
        orderId: order.id,
        slipReference: 'TXN-ABC-001',
        note: 'Paid via online banking',
      },
    });
    expect(slip.statusCode).toBe(201);
    const slipBody = JSON.parse(slip.payload) as { id: string; status: string };
    expect(slipBody.status).toBe('PENDING');

    const pending = await app.inject({
      method: 'GET',
      url: `/api/organiser/payments/pending-slips?organisationId=${seller.organisationId}`,
      headers: { authorization: `Bearer ${seller.token}` },
    });
    expect(pending.statusCode).toBe(200);
    expect(
      (JSON.parse(pending.payload) as { id: string }[]).some(
        (s) => s.id === slipBody.id,
      ),
    ).toBe(true);

    const approve = await app.inject({
      method: 'PATCH',
      url: `/api/organiser/payments/slips/${slipBody.id}?organisationId=${seller.organisationId}`,
      headers: { authorization: `Bearer ${seller.token}` },
      payload: { action: 'approve' },
    });
    expect(approve.statusCode).toBe(200);
    const approved = JSON.parse(approve.payload) as {
      status: string;
      platformFeeAmountLkr: number;
    };
    expect(approved.status).toBe('APPROVED');
    expect(approved.platformFeeAmountLkr).toBe(200); // 5% of 4000

    const tickets = await app.inject({
      method: 'GET',
      url: '/api/tickets',
      headers: { authorization: `Bearer ${student.accessToken}` },
    });
    expect(tickets.statusCode).toBe(200);
    const ticketList = JSON.parse(tickets.payload) as {
      status: string;
      orderId: string;
    }[];
    expect(ticketList.filter((t) => t.orderId === order.id)).toHaveLength(2);
    expect(ticketList.every((t) => t.status === 'VALID')).toBe(true);

    const fee = await prisma.platformFeeLine.findFirst({
      where: { orderId: order.id },
    });
    expect(fee).toBeTruthy();
    expect(fee!.feeAmountLkr).toBe(200);
    expect(Number(fee!.commissionPercent)).toBe(5);

    const tt = await prisma.ticketType.findUniqueOrThrow({
      where: { id: seller.ticketTypeId },
    });
    expect(tt.sold).toBe(2);

    // Reject path: new order, reject slip, re-upload allowed
    const checkout2 = await app.inject({
      method: 'POST',
      url: '/api/checkout',
      headers: { authorization: `Bearer ${student.accessToken}` },
      payload: {
        buyer: {
          name: 'Buyer',
          email: 'buyer@test.lk',
          phone: '0771234567',
        },
        lines: [{ ticketTypeId: seller.ticketTypeId, quantity: 1 }],
      },
    });
    const order2 = JSON.parse(checkout2.payload) as { id: string };
    const slip2 = JSON.parse(
      (
        await app.inject({
          method: 'POST',
          url: '/api/payments/slips',
          headers: { authorization: `Bearer ${student.accessToken}` },
          payload: { orderId: order2.id, slipReference: 'BAD-1' },
        })
      ).payload,
    ) as { id: string };

    const reject = await app.inject({
      method: 'PATCH',
      url: `/api/organiser/payments/slips/${slip2.id}?organisationId=${seller.organisationId}`,
      headers: { authorization: `Bearer ${seller.token}` },
      payload: { action: 'reject', reason: 'Unreadable slip' },
    });
    expect(reject.statusCode).toBe(200);

    const reupload = await app.inject({
      method: 'POST',
      url: '/api/payments/slips',
      headers: { authorization: `Bearer ${student.accessToken}` },
      payload: { orderId: order2.id, slipReference: 'GOOD-2' },
    });
    expect(reupload.statusCode).toBe(201);

    // Refund voids tickets
    const refund = await app.inject({
      method: 'POST',
      url: '/api/refunds',
      headers: { authorization: `Bearer ${student.accessToken}` },
      payload: { orderId: order.id, reason: 'Cannot attend the seminar' },
    });
    expect(refund.statusCode).toBe(201);
    const refundBody = JSON.parse(refund.payload) as { id: string };

    const approveRefund = await app.inject({
      method: 'PATCH',
      url: `/api/organiser/refunds/${refundBody.id}?organisationId=${seller.organisationId}`,
      headers: { authorization: `Bearer ${seller.token}` },
      payload: { action: 'approve' },
    });
    expect(approveRefund.statusCode).toBe(200);

    const ticketsAfter = JSON.parse(
      (
        await app.inject({
          method: 'GET',
          url: '/api/tickets',
          headers: { authorization: `Bearer ${student.accessToken}` },
        })
      ).payload,
    ) as { orderId: string; status: string }[];
    expect(
      ticketsAfter
        .filter((t) => t.orderId === order.id)
        .every((t) => t.status === 'VOID'),
    ).toBe(true);

    const feeAfter = await prisma.platformFeeLine.findFirst({
      where: { orderId: order.id },
    });
    expect(feeAfter!.status).toBe('VOID');

    // ensure seminar still published for hygiene
    const seminar = await prisma.seminar.findUniqueOrThrow({
      where: { id: seller.seminarId },
    });
    expect(seminar.status).toBe(SeminarStatus.PUBLISHED);
  });

  it('returns 501 for PayHere stub', async () => {
    const student = await registerStudent();
    const res = await app.inject({
      method: 'POST',
      url: '/api/payments/payhere',
      headers: { authorization: `Bearer ${student.accessToken}` },
      payload: {},
    });
    expect(res.statusCode).toBe(501);
  });
});
