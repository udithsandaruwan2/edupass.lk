import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Institute entitlement + class attendance (e2e)', () => {
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

  it('rejects individual lecturer on /institute/*', async () => {
    const email = `lec-inst-${Date.now()}@test.lk`;
    const reg = await app.inject({
      method: 'POST',
      url: '/api/auth/register/lecturer',
      payload: {
        email,
        password: 'Password123!',
        name: 'Solo',
        organisationName: `Solo ${Date.now()}`,
      },
    });
    expect(reg.statusCode).toBe(201);
    const body = JSON.parse(reg.payload) as {
      accessToken: string;
      user: { memberships: { organisationId: string }[] };
    };
    const organisationId = body.user.memberships[0].organisationId;

    const usage = await app.inject({
      method: 'GET',
      url: `/api/institute/billing/usage?organisationId=${organisationId}`,
      headers: { authorization: `Bearer ${body.accessToken}` },
    });
    expect(usage.statusCode).toBe(403);

    const batches = await app.inject({
      method: 'POST',
      url: '/api/institute/batches',
      headers: { authorization: `Bearer ${body.accessToken}` },
      payload: { organisationId, name: 'Should fail' },
    });
    expect(batches.statusCode).toBe(403);
  });

  it('marks class AttendanceRecord separately from CheckInEvent', async () => {
    const email = `inst-att-${Date.now()}@test.lk`;
    const reg = await app.inject({
      method: 'POST',
      url: '/api/auth/register/institution',
      payload: {
        email,
        password: 'Password123!',
        name: 'Owner',
        organisationName: `Inst ${Date.now()}`,
      },
    });
    const body = JSON.parse(reg.payload) as {
      accessToken: string;
      user: { memberships: { organisationId: string }[] };
    };
    const organisationId = body.user.memberships[0].organisationId;
    const token = body.accessToken;

    const batch = JSON.parse(
      (
        await app.inject({
          method: 'POST',
          url: '/api/institute/batches',
          headers: { authorization: `Bearer ${token}` },
          payload: { organisationId, name: 'A/L Physics' },
        })
      ).payload,
    ) as { id: string };

    const enrollment = JSON.parse(
      (
        await app.inject({
          method: 'POST',
          url: '/api/institute/enrollments',
          headers: { authorization: `Bearer ${token}` },
          payload: {
            organisationId,
            batchId: batch.id,
            displayName: 'Nethmi Perera',
          },
        })
      ).payload,
    ) as { id: string };

    const session = JSON.parse(
      (
        await app.inject({
          method: 'POST',
          url: '/api/institute/sessions',
          headers: { authorization: `Bearer ${token}` },
          payload: {
            organisationId,
            batchId: batch.id,
            title: 'Week 1',
            startsAt: new Date().toISOString(),
          },
        })
      ).payload,
    ) as { id: string };

    const mark = await app.inject({
      method: 'POST',
      url: `/api/institute/sessions/${session.id}/attendance`,
      headers: { authorization: `Bearer ${token}` },
      payload: {
        organisationId,
        marks: [{ enrollmentId: enrollment.id, status: 'PRESENT' }],
      },
    });
    expect(mark.statusCode).toBe(201);

    const roll = await app.inject({
      method: 'GET',
      url: `/api/institute/sessions/${session.id}/attendance?organisationId=${organisationId}`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(roll.statusCode).toBe(200);
    const rollBody = JSON.parse(roll.payload) as {
      roll: { enrollmentId: string; status: string }[];
    };
    expect(rollBody.roll[0]?.status).toBe('PRESENT');

    const attendanceCount = await prisma.attendanceRecord.count({
      where: { sessionId: session.id },
    });
    const checkInCount = await prisma.checkInEvent.count({
      where: { organisationId },
    });
    expect(attendanceCount).toBe(1);
    expect(checkInCount).toBe(0);
  });
});
