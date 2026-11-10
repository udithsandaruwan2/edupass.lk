import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { GlobalRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Plans admin + PlanLimitService (e2e)', () => {
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
      update: { ticketCommissionPercent: 5 },
      create: { id: 'default', ticketCommissionPercent: 5 },
    });
    await prisma.subscriptionPlan.upsert({
      where: { code: 'free' },
      update: { maxBatches: 2, maxStudents: 50, maxStaff: 5, priceLkr: 0 },
      create: {
        code: 'free',
        name: 'Free',
        priceLkr: 0,
        maxBatches: 2,
        maxStudents: 50,
        maxStaff: 5,
      },
    });
    await prisma.subscriptionPlan.upsert({
      where: { code: 'premium' },
      update: { priceLkr: 9900, maxBatches: 20, maxStudents: 500 },
      create: {
        code: 'premium',
        name: 'Premium',
        priceLkr: 9900,
        maxBatches: 20,
        maxStudents: 500,
        maxStaff: 25,
      },
    });

    const hash = await bcrypt.hash('Password123!', 10);
    await prisma.user.upsert({
      where: { email: 'admin-billing@edupass.lk' },
      update: {
        passwordHash: hash,
        isPlatformAdmin: true,
        globalRole: GlobalRole.ADMIN,
      },
      create: {
        email: 'admin-billing@edupass.lk',
        passwordHash: hash,
        name: 'Billing Admin',
        isPlatformAdmin: true,
        globalRole: GlobalRole.ADMIN,
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  async function adminToken() {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'admin-billing@edupass.lk',
        password: 'Password123!',
      },
    });
    expect(res.statusCode).toBe(201);
    return (JSON.parse(res.payload) as { accessToken: string }).accessToken;
  }

  async function registerInstitute() {
    const email = `bill-inst-${Date.now()}@test.lk`;
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register/institution',
      payload: {
        email,
        password: 'Password123!',
        name: 'Owner',
        organisationName: `Billing Org ${Date.now()}`,
      },
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload) as {
      accessToken: string;
      user: { memberships: { organisationId: string }[] };
    };
    return {
      token: body.accessToken,
      organisationId: body.user.memberships[0].organisationId,
    };
  }

  it('admin updates global commission % without deploy', async () => {
    const token = await adminToken();
    const put = await app.inject({
      method: 'PUT',
      url: '/api/admin/settings',
      headers: { authorization: `Bearer ${token}` },
      payload: { ticketCommissionPercent: 6.5 },
    });
    expect(put.statusCode).toBe(200);
    const body = JSON.parse(put.payload) as {
      ticketCommissionPercent: number;
    };
    expect(body.ticketCommissionPercent).toBe(6.5);

    const get = await app.inject({
      method: 'GET',
      url: '/api/admin/settings',
      headers: { authorization: `Bearer ${token}` },
    });
    expect(
      (JSON.parse(get.payload) as { ticketCommissionPercent: number })
        .ticketCommissionPercent,
    ).toBe(6.5);

    // restore for other suites
    await app.inject({
      method: 'PUT',
      url: '/api/admin/settings',
      headers: { authorization: `Bearer ${token}` },
      payload: { ticketCommissionPercent: 5 },
    });
  });

  it('blocks Free org at batch cap and allows upgrade invoice slip', async () => {
    const inst = await registerInstitute();

    const b1 = await app.inject({
      method: 'POST',
      url: '/api/institute/batches',
      headers: { authorization: `Bearer ${inst.token}` },
      payload: { organisationId: inst.organisationId, name: 'Batch A' },
    });
    expect(b1.statusCode).toBe(201);

    const b2 = await app.inject({
      method: 'POST',
      url: '/api/institute/batches',
      headers: { authorization: `Bearer ${inst.token}` },
      payload: { organisationId: inst.organisationId, name: 'Batch B' },
    });
    expect(b2.statusCode).toBe(201);

    const blocked = await app.inject({
      method: 'POST',
      url: '/api/institute/batches',
      headers: { authorization: `Bearer ${inst.token}` },
      payload: { organisationId: inst.organisationId, name: 'Batch C' },
    });
    expect(blocked.statusCode).toBe(403);

    const usage = await app.inject({
      method: 'GET',
      url: `/api/institute/billing/usage?organisationId=${inst.organisationId}`,
      headers: { authorization: `Bearer ${inst.token}` },
    });
    expect(usage.statusCode).toBe(200);
    const usageBody = JSON.parse(usage.payload) as {
      counts: { batches: number };
      remaining: { batches: number };
    };
    expect(usageBody.counts.batches).toBe(2);
    expect(usageBody.remaining.batches).toBe(0);

    const upgrade = await app.inject({
      method: 'POST',
      url: '/api/institute/billing/upgrade',
      headers: { authorization: `Bearer ${inst.token}` },
      payload: {
        organisationId: inst.organisationId,
        planCode: 'premium',
      },
    });
    expect(upgrade.statusCode).toBe(201);
    const upBody = JSON.parse(upgrade.payload) as {
      mode: string;
      invoice: { id: string; amountLkr: number };
    };
    expect(upBody.mode).toBe('invoice');
    expect(upBody.invoice.amountLkr).toBe(9900);

    const slip = await app.inject({
      method: 'POST',
      url: '/api/institute/billing/slips',
      headers: { authorization: `Bearer ${inst.token}` },
      payload: {
        organisationId: inst.organisationId,
        invoiceId: upBody.invoice.id,
        slipReference: 'PLAT-SLIP-1',
      },
    });
    expect(slip.statusCode).toBe(201);

    const admin = await adminToken();
    const approve = await app.inject({
      method: 'PATCH',
      url: `/api/admin/payments/platform-invoices/${upBody.invoice.id}`,
      headers: { authorization: `Bearer ${admin}` },
      payload: { action: 'approve' },
    });
    expect(approve.statusCode).toBe(200);

    const b3 = await app.inject({
      method: 'POST',
      url: '/api/institute/batches',
      headers: { authorization: `Bearer ${inst.token}` },
      payload: { organisationId: inst.organisationId, name: 'Batch C' },
    });
    expect(b3.statusCode).toBe(201);
  });
});
