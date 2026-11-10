import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Tuition fees (e2e)', () => {
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

  it('cash path pays tuition invoice; student sees outstanding then zero', async () => {
    const stamp = Date.now();
    const inst = await app.inject({
      method: 'POST',
      url: '/api/auth/register/institution',
      payload: {
        email: `inst-tu-${stamp}@test.lk`,
        password: 'Password123!',
        name: 'Owner',
        organisationName: `Tuition Inst ${stamp}`,
      },
    });
    expect(inst.statusCode).toBe(201);
    const instBody = JSON.parse(inst.payload) as {
      accessToken: string;
      user: { memberships: { organisationId: string }[] };
    };
    const organisationId = instBody.user.memberships[0].organisationId;
    const staffToken = instBody.accessToken;

    const student = await app.inject({
      method: 'POST',
      url: '/api/auth/register/student',
      payload: {
        email: `stu-tu-${stamp}@test.lk`,
        password: 'Password123!',
        name: 'Nethmi',
      },
    });
    expect(student.statusCode).toBe(201);
    const studentBody = JSON.parse(student.payload) as {
      accessToken: string;
      user: { id: string };
    };

    const enrollment = JSON.parse(
      (
        await app.inject({
          method: 'POST',
          url: '/api/institute/enrollments',
          headers: { authorization: `Bearer ${staffToken}` },
          payload: {
            organisationId,
            displayName: 'Nethmi',
            studentUserId: studentBody.user.id,
          },
        })
      ).payload,
    ) as { id: string };

    const plan = JSON.parse(
      (
        await app.inject({
          method: 'POST',
          url: '/api/institute/tuition/fee-plans',
          headers: { authorization: `Bearer ${staffToken}` },
          payload: {
            organisationId,
            name: 'Monthly class fees',
            amountLkr: 5000,
          },
        })
      ).payload,
    ) as { id: string };

    const invoice = JSON.parse(
      (
        await app.inject({
          method: 'POST',
          url: '/api/institute/tuition/invoices',
          headers: { authorization: `Bearer ${staffToken}` },
          payload: {
            organisationId,
            enrollmentId: enrollment.id,
            feePlanId: plan.id,
          },
        })
      ).payload,
    ) as { id: string; remainingLkr: number; title: string };
    expect(invoice.remainingLkr).toBe(5000);
    expect(invoice.title).toBe('Monthly class fees');

    const balanceOpen = await app.inject({
      method: 'GET',
      url: '/api/student/tuition/invoices',
      headers: { authorization: `Bearer ${studentBody.accessToken}` },
    });
    expect(balanceOpen.statusCode).toBe(200);
    const openBody = JSON.parse(balanceOpen.payload) as {
      outstandingLkr: number;
    };
    expect(openBody.outstandingLkr).toBe(5000);

    const cash = await app.inject({
      method: 'POST',
      url: `/api/institute/tuition/invoices/${invoice.id}/cash`,
      headers: { authorization: `Bearer ${staffToken}` },
      payload: { organisationId },
    });
    expect(cash.statusCode).toBe(201);

    const balancePaid = await app.inject({
      method: 'GET',
      url: '/api/student/tuition/invoices',
      headers: { authorization: `Bearer ${studentBody.accessToken}` },
    });
    const paidBody = JSON.parse(balancePaid.payload) as {
      outstandingLkr: number;
    };
    expect(paidBody.outstandingLkr).toBe(0);

    // Money split: no PlatformInvoice / PlatformFeeLine created for tuition cash
    const platformInvoices = await prisma.platformInvoice.count({
      where: { organisationId },
    });
    const feeLines = await prisma.platformFeeLine.count({
      where: { organisationId },
    });
    expect(platformInvoices).toBe(0);
    expect(feeLines).toBe(0);
  });

  it('bank slip path: student upload then staff approve', async () => {
    const stamp = Date.now();
    const inst = await app.inject({
      method: 'POST',
      url: '/api/auth/register/institution',
      payload: {
        email: `inst-slip-${stamp}@test.lk`,
        password: 'Password123!',
        name: 'Owner',
        organisationName: `Slip Inst ${stamp}`,
      },
    });
    const instBody = JSON.parse(inst.payload) as {
      accessToken: string;
      user: { memberships: { organisationId: string }[] };
    };
    const organisationId = instBody.user.memberships[0].organisationId;
    const staffToken = instBody.accessToken;

    const student = await app.inject({
      method: 'POST',
      url: '/api/auth/register/student',
      payload: {
        email: `stu-slip-${stamp}@test.lk`,
        password: 'Password123!',
        name: 'Kasun',
      },
    });
    const studentBody = JSON.parse(student.payload) as {
      accessToken: string;
      user: { id: string };
    };

    const enrollment = JSON.parse(
      (
        await app.inject({
          method: 'POST',
          url: '/api/institute/enrollments',
          headers: { authorization: `Bearer ${staffToken}` },
          payload: {
            organisationId,
            displayName: 'Kasun',
            studentUserId: studentBody.user.id,
          },
        })
      ).payload,
    ) as { id: string };

    const invoice = JSON.parse(
      (
        await app.inject({
          method: 'POST',
          url: '/api/institute/tuition/invoices',
          headers: { authorization: `Bearer ${staffToken}` },
          payload: {
            organisationId,
            enrollmentId: enrollment.id,
            title: 'Term class fees',
            amountLkr: 3000,
          },
        })
      ).payload,
    ) as { id: string };

    const slip = await app.inject({
      method: 'POST',
      url: '/api/student/tuition/slips',
      headers: { authorization: `Bearer ${studentBody.accessToken}` },
      payload: {
        invoiceId: invoice.id,
        slipReference: `TUITION-${stamp}`,
      },
    });
    expect(slip.statusCode).toBe(201);
    const slipBody = JSON.parse(slip.payload) as { id: string; status: string };
    expect(slipBody.status).toBe('PENDING');

    const stillOpen = JSON.parse(
      (
        await app.inject({
          method: 'GET',
          url: '/api/student/tuition/invoices',
          headers: { authorization: `Bearer ${studentBody.accessToken}` },
        })
      ).payload,
    ) as { outstandingLkr: number };
    expect(stillOpen.outstandingLkr).toBe(3000);

    const approve = await app.inject({
      method: 'POST',
      url: `/api/institute/tuition/payments/${slipBody.id}/review`,
      headers: { authorization: `Bearer ${staffToken}` },
      payload: { organisationId, decision: 'approve' },
    });
    expect(approve.statusCode).toBe(201);

    const cleared = JSON.parse(
      (
        await app.inject({
          method: 'GET',
          url: '/api/student/tuition/invoices',
          headers: { authorization: `Bearer ${studentBody.accessToken}` },
        })
      ).payload,
    ) as { outstandingLkr: number };
    expect(cleared.outstandingLkr).toBe(0);
  });
});
