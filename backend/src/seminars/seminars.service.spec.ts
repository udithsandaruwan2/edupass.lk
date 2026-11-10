import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { CheckInMode, SeminarStatus } from '@prisma/client';
import { SeminarsService } from './seminars.service';
import { slugifyTitle } from './seminars.mapper';

describe('SeminarsService helpers', () => {
  it('slugifies titles', () => {
    expect(slugifyTitle('A/L Economics Model Paper!')).toBe(
      'a-l-economics-model-paper',
    );
  });
});

describe('SeminarsService.publish', () => {
  const prisma = {
    seminar: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  const service = new SeminarsService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects publish without checkInMode', async () => {
    prisma.seminar.findUnique.mockResolvedValue({
      id: 's1',
      organisationId: 'org1',
      status: SeminarStatus.DRAFT,
      checkInMode: null,
      ticketTypes: [{ id: 't1', sold: 0 }],
    });

    await expect(service.publish('s1', 'org1', {})).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('publishes when checkInMode provided in body', async () => {
    prisma.seminar.findUnique.mockResolvedValue({
      id: 's1',
      organisationId: 'org1',
      status: SeminarStatus.DRAFT,
      checkInMode: null,
      ticketTypes: [{ id: 't1', sold: 0 }],
      startsAt: new Date(),
      durationHours: 4,
      highlights: [],
      agenda: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: 'demo',
      title: 'Demo Seminar Title Here',
      subject: 'Economics',
      level: 'AL',
      categoryId: null,
      lecturerProfileId: null,
      mode: 'PHYSICAL',
      venue: 'Hall',
      district: 'Colombo',
      summary: 'A summary that is long enough for publish',
      description: 'desc',
      featured: false,
      language: 'Sinhala',
      image: null,
    });
    prisma.seminar.update.mockImplementation(async ({ data }: { data: unknown }) => ({
      id: 's1',
      organisationId: 'org1',
      status: SeminarStatus.PUBLISHED,
      checkInMode: CheckInMode.QR_GATE,
      ticketTypes: [
        {
          id: 't1',
          name: 'Standard',
          description: '',
          priceLkr: 1500,
          capacity: 10,
          sold: 0,
        },
      ],
      startsAt: new Date(),
      durationHours: 4,
      highlights: [],
      agenda: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: 'demo',
      title: 'Demo Seminar Title Here',
      subject: 'Economics',
      level: 'AL',
      categoryId: null,
      lecturerProfileId: null,
      mode: 'PHYSICAL',
      venue: 'Hall',
      district: 'Colombo',
      summary: 'A summary that is long enough for publish',
      description: 'desc',
      featured: false,
      language: 'Sinhala',
      image: null,
      ...(data as object),
    }));

    const result = await service.publish('s1', 'org1', {
      checkInMode: CheckInMode.QR_GATE,
    });
    expect(result.status).toBe(SeminarStatus.PUBLISHED);
    expect(result.checkInMode).toBe(CheckInMode.QR_GATE);
  });

  it('forbids cross-tenant mutation', async () => {
    prisma.seminar.findUnique.mockResolvedValue({
      id: 's1',
      organisationId: 'org-other',
      status: SeminarStatus.DRAFT,
      checkInMode: CheckInMode.QR_GATE,
      ticketTypes: [],
    });
    await expect(service.publish('s1', 'org1', {})).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
