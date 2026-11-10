import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Auth + OrgScope (e2e)', () => {
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

    // Ensure free plan exists for institution register
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

  it('registers lecturer without institute entitlement', async () => {
    const email = `lect-${Date.now()}@test.lk`;
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register/lecturer',
      payload: {
        email,
        password: 'Password123!',
        name: 'Test Lecturer',
      },
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload) as {
      accessToken: string;
      user: { memberships: { entitlements: { code: string }[] }[] };
    };
    expect(body.accessToken).toBeTruthy();
    const codes = body.user.memberships[0]?.entitlements.map((e) => e.code) ?? [];
    expect(codes).toContain('SEMINARS');
    expect(codes).not.toContain('INSTITUTE');
  });

  it('registers institution with free plan and both entitlements', async () => {
    const email = `inst-${Date.now()}@test.lk`;
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register/institution',
      payload: {
        email,
        password: 'Password123!',
        name: 'Owner',
        organisationName: `Org ${Date.now()}`,
      },
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload) as {
      user: {
        memberships: {
          plan: { code: string } | null;
          entitlements: { code: string }[];
        }[];
      };
    };
    const m = body.user.memberships[0];
    expect(m.plan?.code).toBe('free');
    const codes = m.entitlements.map((e) => e.code);
    expect(codes).toEqual(expect.arrayContaining(['SEMINARS', 'INSTITUTE']));
  });

  it('rejects cross-tenant organisation summary', async () => {
    const aEmail = `a-${Date.now()}@test.lk`;
    const bEmail = `b-${Date.now()}@test.lk`;
    const a = JSON.parse(
      (
        await app.inject({
          method: 'POST',
          url: '/api/auth/register/institution',
          payload: {
            email: aEmail,
            password: 'Password123!',
            name: 'A',
            organisationName: `A ${Date.now()}`,
          },
        })
      ).payload,
    ) as {
      accessToken: string;
      user: { memberships: { organisationId: string }[] };
    };
    const b = JSON.parse(
      (
        await app.inject({
          method: 'POST',
          url: '/api/auth/register/institution',
          payload: {
            email: bEmail,
            password: 'Password123!',
            name: 'B',
            organisationName: `B ${Date.now()}`,
          },
        })
      ).payload,
    ) as {
      accessToken: string;
      user: { memberships: { organisationId: string }[] };
    };

    const orgB = b.user.memberships[0].organisationId;
    const denied = await app.inject({
      method: 'GET',
      url: `/api/organisations/${orgB}/summary`,
      headers: { authorization: `Bearer ${a.accessToken}` },
    });
    expect(denied.statusCode).toBe(403);

    const allowed = await app.inject({
      method: 'GET',
      url: `/api/organisations/${orgB}/summary`,
      headers: { authorization: `Bearer ${b.accessToken}` },
    });
    expect(allowed.statusCode).toBe(200);
  });
});
