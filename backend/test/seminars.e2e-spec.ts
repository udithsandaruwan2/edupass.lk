import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { CheckInMode, ExamLevel, SeminarMode } from '@prisma/client';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Seminars catalogue + organiser CRUD (e2e)', () => {
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

  async function registerLecturer(suffix: string) {
    const email = `sem-${suffix}-${Date.now()}@test.lk`;
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register/lecturer',
      payload: {
        email,
        password: 'Password123!',
        name: `Lecturer ${suffix}`,
        organisationName: `Org ${suffix} ${Date.now()}`,
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

  function draftPayload(organisationId: string, title: string) {
    const starts = new Date();
    starts.setDate(starts.getDate() + 21);
    return {
      organisationId,
      title,
      subject: 'Economics',
      level: ExamLevel.AL,
      mode: SeminarMode.PHYSICAL,
      venue: 'Test Hall',
      district: 'Colombo',
      startsAt: starts.toISOString(),
      durationHours: 4,
      summary: 'A summary that is definitely long enough.',
      description: 'Full description for the seminar.',
      highlights: ['Paper'],
      agenda: [{ time: '08:30', title: 'Start' }],
      ticketTypes: [
        {
          name: 'Standard',
          description: 'Seat',
          priceLkr: 1500,
          capacity: 50,
        },
      ],
    };
  }

  it('lists only published upcoming seminars publicly', async () => {
    const { token, organisationId } = await registerLecturer('pub');
    const create = await app.inject({
      method: 'POST',
      url: '/api/organiser/seminars',
      headers: { authorization: `Bearer ${token}` },
      payload: draftPayload(organisationId, 'Public List Seminar Title'),
    });
    expect(create.statusCode).toBe(201);
    const created = JSON.parse(create.payload) as { id: string; slug: string };

    const before = await app.inject({ method: 'GET', url: '/api/seminars' });
    expect(before.statusCode).toBe(200);
    const beforeList = JSON.parse(before.payload) as { id: string }[];
    expect(beforeList.find((s) => s.id === created.id)).toBeUndefined();

    const badPublish = await app.inject({
      method: 'POST',
      url: `/api/organiser/seminars/${created.id}/publish?organisationId=${organisationId}`,
      headers: { authorization: `Bearer ${token}` },
      payload: {},
    });
    expect(badPublish.statusCode).toBe(400);

    const publish = await app.inject({
      method: 'POST',
      url: `/api/organiser/seminars/${created.id}/publish?organisationId=${organisationId}`,
      headers: { authorization: `Bearer ${token}` },
      payload: { checkInMode: CheckInMode.QR_GATE },
    });
    expect(publish.statusCode).toBe(201);
    const published = JSON.parse(publish.payload) as {
      status: string;
      checkInMode: string;
    };
    expect(published.status).toBe('PUBLISHED');
    expect(published.checkInMode).toBe('QR_GATE');

    const after = await app.inject({
      method: 'GET',
      url: '/api/seminars?subject=Economics&district=Colombo',
    });
    expect(after.statusCode).toBe(200);
    const afterList = JSON.parse(after.payload) as { id: string }[];
    expect(afterList.some((s) => s.id === created.id)).toBe(true);

    const detail = await app.inject({
      method: 'GET',
      url: `/api/seminars/${created.slug}`,
    });
    expect(detail.statusCode).toBe(200);
  });

  it('blocks cross-tenant seminar mutation', async () => {
    const a = await registerLecturer('a');
    const b = await registerLecturer('b');
    const create = await app.inject({
      method: 'POST',
      url: '/api/organiser/seminars',
      headers: { authorization: `Bearer ${a.token}` },
      payload: draftPayload(a.organisationId, 'Tenant Isolation Seminar XX'),
    });
    expect(create.statusCode).toBe(201);
    const created = JSON.parse(create.payload) as { id: string };

    const steal = await app.inject({
      method: 'POST',
      url: `/api/organiser/seminars/${created.id}/publish?organisationId=${b.organisationId}`,
      headers: { authorization: `Bearer ${b.token}` },
      payload: { checkInMode: CheckInMode.BOTH },
    });
    expect(steal.statusCode).toBe(403);
  });
});
