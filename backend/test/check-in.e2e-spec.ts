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
} from '@prisma/client';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Check-in (e2e)', () => {
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
      update: {},
      create: { id: 'default', ticketCommissionPercent: 5 },
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

  async function paidTicketForSeller() {
    const sellerEmail = `cin-s-${Date.now()}@test.lk`;
    const sellerRes = await app.inject({
      method: 'POST',
      url: '/api/auth/register/lecturer',
      payload: {
        email: sellerEmail,
        password: 'Password123!',
        name: 'Gate Seller',
        organisationName: `Gate ${Date.now()}`,
      },
    });
    const seller = JSON.parse(sellerRes.payload) as {
      accessToken: string;
      user: { memberships: { organisationId: string }[] };
    };
    const organisationId = seller.user.memberships[0].organisationId;

    const starts = new Date();
    starts.setDate(starts.getDate() + 7);
    const create = await app.inject({
      method: 'POST',
      url: '/api/organiser/seminars',
      headers: { authorization: `Bearer ${seller.accessToken}` },
      payload: {
        organisationId,
        title: 'Check In Seminar Title XX',
        subject: 'Economics',
        level: ExamLevel.AL,
        mode: SeminarMode.PHYSICAL,
        venue: 'Gate Hall',
        district: 'Colombo',
        startsAt: starts.toISOString(),
        durationHours: 2,
        summary: 'Summary long enough for check-in e2e coverage.',
        description: 'Desc',
        ticketTypes: [
          { name: 'Gate', description: '', priceLkr: 1000, capacity: 10 },
        ],
      },
    });
    const seminar = JSON.parse(create.payload) as {
      id: string;
      ticketTypes: { id: string }[];
    };
    await app.inject({
      method: 'POST',
      url: `/api/organiser/seminars/${seminar.id}/publish?organisationId=${organisationId}`,
      headers: { authorization: `Bearer ${seller.accessToken}` },
      payload: { checkInMode: CheckInMode.QR_GATE },
    });

    const studentRes = await app.inject({
      method: 'POST',
      url: '/api/auth/register/student',
      payload: {
        email: `cin-u-${Date.now()}@test.lk`,
        password: 'Password123!',
        name: 'Gate Student',
      },
    });
    const student = JSON.parse(studentRes.payload) as { accessToken: string };

    const order = JSON.parse(
      (
        await app.inject({
          method: 'POST',
          url: '/api/checkout',
          headers: { authorization: `Bearer ${student.accessToken}` },
          payload: {
            buyer: {
              name: 'Gate Student',
              email: 'g@test.lk',
              phone: '0770000000',
            },
            lines: [{ ticketTypeId: seminar.ticketTypes[0].id, quantity: 1 }],
          },
        })
      ).payload,
    ) as { id: string };

    const slip = JSON.parse(
      (
        await app.inject({
          method: 'POST',
          url: '/api/payments/slips',
          headers: { authorization: `Bearer ${student.accessToken}` },
          payload: { orderId: order.id, slipReference: 'GATE-1' },
        })
      ).payload,
    ) as { id: string };

    await app.inject({
      method: 'PATCH',
      url: `/api/organiser/payments/slips/${slip.id}?organisationId=${organisationId}`,
      headers: { authorization: `Bearer ${seller.accessToken}` },
      payload: { action: 'approve' },
    });

    const tickets = JSON.parse(
      (
        await app.inject({
          method: 'GET',
          url: '/api/tickets',
          headers: { authorization: `Bearer ${student.accessToken}` },
        })
      ).payload,
    ) as { code: string; seminarId: string }[];

    return {
      sellerToken: seller.accessToken,
      organisationId,
      seminarId: seminar.id,
      code: tickets[0].code,
    };
  }

  it('admits once, rejects duplicate, rejects wrong seminar and cross-tenant', async () => {
    const a = await paidTicketForSeller();
    const b = await paidTicketForSeller();

    const admit = await app.inject({
      method: 'POST',
      url: '/api/organiser/check-in',
      headers: { authorization: `Bearer ${a.sellerToken}` },
      payload: {
        organisationId: a.organisationId,
        seminarId: a.seminarId,
        code: `EDUPASS-DEMO:${a.code}`,
      },
    });
    expect(admit.statusCode).toBe(200);
    const admitted = JSON.parse(admit.payload) as {
      ok: boolean;
      result: string;
      ticket: { status: string };
    };
    expect(admitted.ok).toBe(true);
    expect(admitted.result).toBe('ADMITTED');
    expect(admitted.ticket.status).toBe('CHECKED_IN');

    const events = await prisma.checkInEvent.findMany({
      where: { seminarId: a.seminarId, result: 'ADMITTED' },
    });
    expect(events.length).toBeGreaterThanOrEqual(1);

    const dup = await app.inject({
      method: 'POST',
      url: '/api/organiser/check-in',
      headers: { authorization: `Bearer ${a.sellerToken}` },
      payload: {
        organisationId: a.organisationId,
        seminarId: a.seminarId,
        code: a.code,
      },
    });
    expect(dup.statusCode).toBe(409);

    const wrongSeminar = await app.inject({
      method: 'POST',
      url: '/api/organiser/check-in',
      headers: { authorization: `Bearer ${a.sellerToken}` },
      payload: {
        organisationId: a.organisationId,
        seminarId: a.seminarId,
        code: b.code,
      },
    });
    expect(wrongSeminar.statusCode).toBe(200);
    const wrongBody = JSON.parse(wrongSeminar.payload) as {
      ok: boolean;
      result: string;
    };
    // b's ticket is other org → CROSS_TENANT (or WRONG_SEMINAR if same org somehow)
    expect(wrongBody.ok).toBe(false);
    expect(['CROSS_TENANT', 'WRONG_SEMINAR']).toContain(wrongBody.result);

    const attendance = await app.inject({
      method: 'GET',
      url: `/api/organiser/seminars/${a.seminarId}/attendance?organisationId=${a.organisationId}`,
      headers: { authorization: `Bearer ${a.sellerToken}` },
    });
    expect(attendance.statusCode).toBe(200);
    const list = JSON.parse(attendance.payload) as {
      totals: { checkedIn: number; total: number };
    };
    expect(list.totals.checkedIn).toBe(1);
    expect(list.totals.total).toBe(1);
  });
});
