import {
  PrismaClient,
  OrgType,
  OrgStatus,
  EntitlementCode,
  EntitlementStatus,
  StaffRole,
  SubscriptionStatus,
  GlobalRole,
  CheckInMode,
  SeminarMode,
  SeminarStatus,
  ExamLevel,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  await prisma.platformSettings.upsert({
    where: { id: 'default' },
    update: { ticketCommissionPercent: 5.0, payhereEnabled: false },
    create: {
      id: 'default',
      ticketCommissionPercent: 5.0,
      payhereEnabled: false,
    },
  });

  await prisma.bankAccount.upsert({
    where: { id: 'seed-edupass-platform-bank' },
    update: {
      bankName: 'Bank of Ceylon',
      accountName: 'EduPass Platform',
      accountNumber: '7009988776',
      branch: 'Head Office',
      isPlatform: true,
      organisationId: null,
    },
    create: {
      id: 'seed-edupass-platform-bank',
      bankName: 'Bank of Ceylon',
      accountName: 'EduPass Platform',
      accountNumber: '7009988776',
      branch: 'Head Office',
      isPlatform: true,
    },
  });

  const plans = [
    {
      code: 'free',
      name: 'Free',
      description: 'Testing plan with limited institute capacity',
      priceLkr: 0,
      maxBatches: 2,
      maxStudents: 50,
      maxStaff: 5,
      maxSeminarsPerMonth: 5,
      instituteEnabled: true,
      seminarsEnabled: true,
      ticketCommissionPercent: null as number | null,
      sortOrder: 1,
    },
    {
      code: 'premium',
      name: 'Premium',
      description: 'Growing institutes',
      priceLkr: 9900,
      maxBatches: 20,
      maxStudents: 500,
      maxStaff: 25,
      maxSeminarsPerMonth: 50,
      instituteEnabled: true,
      seminarsEnabled: true,
      ticketCommissionPercent: 4.0,
      sortOrder: 2,
    },
    {
      code: 'platinum',
      name: 'Platinum',
      description: 'Large institutes',
      priceLkr: 24900,
      maxBatches: null,
      maxStudents: null,
      maxStaff: null,
      maxSeminarsPerMonth: null,
      instituteEnabled: true,
      seminarsEnabled: true,
      ticketCommissionPercent: 0,
      sortOrder: 3,
    },
  ];

  for (const p of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { code: p.code },
      update: {
        name: p.name,
        description: p.description,
        priceLkr: p.priceLkr,
        maxBatches: p.maxBatches,
        maxStudents: p.maxStudents,
        maxStaff: p.maxStaff,
        maxSeminarsPerMonth: p.maxSeminarsPerMonth,
        instituteEnabled: p.instituteEnabled,
        seminarsEnabled: p.seminarsEnabled,
        ticketCommissionPercent: p.ticketCommissionPercent,
        sortOrder: p.sortOrder,
        active: true,
      },
      create: {
        ...p,
        active: true,
      },
    });
  }

  const free = await prisma.subscriptionPlan.findUniqueOrThrow({
    where: { code: 'free' },
  });

  const categories = [
    {
      slug: 'economics',
      name: 'Economics',
      description: 'A/L Economics revision and model papers',
      icon: 'chart',
    },
    {
      slug: 'science',
      name: 'Science',
      description: 'Physics, Chemistry, Biology',
      icon: 'flask',
    },
    {
      slug: 'mathematics',
      name: 'Mathematics',
      description: 'Combined Maths and Pure Maths',
      icon: 'sigma',
    },
  ];
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        description: c.description,
        icon: c.icon,
      },
      create: c,
    });
  }

  const seedQa = process.env.SEED_QA !== 'false';
  if (!seedQa) {
    console.log(
      'Seed complete (plans, bank, categories). SEED_QA=false — skipped sample users/seminars.',
    );
    return;
  }

  const passwordHash = await bcrypt.hash('Password123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@edupass.lk' },
    update: {
      passwordHash,
      name: 'Platform Admin',
      isPlatformAdmin: true,
      globalRole: GlobalRole.ADMIN,
    },
    create: {
      email: 'admin@edupass.lk',
      passwordHash,
      name: 'Platform Admin',
      isPlatformAdmin: true,
      globalRole: GlobalRole.ADMIN,
    },
  });

  async function seedInstitute(slug: string, name: string, ownerEmail: string) {
    const owner = await prisma.user.upsert({
      where: { email: ownerEmail },
      update: { passwordHash, name: `${name} Owner` },
      create: {
        email: ownerEmail,
        passwordHash,
        name: `${name} Owner`,
      },
    });
    const org = await prisma.organisation.upsert({
      where: { slug },
      update: { name, type: OrgType.INSTITUTE, status: OrgStatus.ACTIVE },
      create: {
        name,
        slug,
        type: OrgType.INSTITUTE,
        status: OrgStatus.ACTIVE,
      },
    });
    for (const code of [EntitlementCode.SEMINARS, EntitlementCode.INSTITUTE]) {
      await prisma.organisationEntitlement.upsert({
        where: {
          organisationId_code: { organisationId: org.id, code },
        },
        update: { status: EntitlementStatus.ACTIVE },
        create: {
          organisationId: org.id,
          code,
          status: EntitlementStatus.ACTIVE,
        },
      });
    }
    await prisma.staffMembership.upsert({
      where: {
        userId_organisationId: { userId: owner.id, organisationId: org.id },
      },
      update: { role: StaffRole.OWNER },
      create: {
        userId: owner.id,
        organisationId: org.id,
        role: StaffRole.OWNER,
      },
    });
    const existingSub = await prisma.organisationSubscription.findFirst({
      where: { organisationId: org.id },
    });
    if (!existingSub) {
      await prisma.organisationSubscription.create({
        data: {
          organisationId: org.id,
          planId: free.id,
          status: SubscriptionStatus.ACTIVE,
        },
      });
    }
    return org;
  }

  await seedInstitute('lumina-academy', 'Lumina Academy', 'institute-a@edupass.lk');
  await seedInstitute('summit-college', 'Summit College', 'institute-b@edupass.lk');

  const lecturer = await prisma.user.upsert({
    where: { email: 'lecturer@edupass.lk' },
    update: { passwordHash, name: 'Solo Lecturer' },
    create: {
      email: 'lecturer@edupass.lk',
      passwordHash,
      name: 'Solo Lecturer',
    },
  });
  const lecturerOrg = await prisma.organisation.upsert({
    where: { slug: 'solo-lecturer' },
    update: {
      name: 'Solo Lecturer Seminars',
      type: OrgType.INDIVIDUAL_LECTURER,
      status: OrgStatus.ACTIVE,
    },
    create: {
      name: 'Solo Lecturer Seminars',
      slug: 'solo-lecturer',
      type: OrgType.INDIVIDUAL_LECTURER,
      status: OrgStatus.ACTIVE,
    },
  });
  await prisma.organisationEntitlement.upsert({
    where: {
      organisationId_code: {
        organisationId: lecturerOrg.id,
        code: EntitlementCode.SEMINARS,
      },
    },
    update: { status: EntitlementStatus.ACTIVE },
    create: {
      organisationId: lecturerOrg.id,
      code: EntitlementCode.SEMINARS,
      status: EntitlementStatus.ACTIVE,
    },
  });
  // Ensure no INSTITUTE entitlement for lecturer
  await prisma.organisationEntitlement.deleteMany({
    where: {
      organisationId: lecturerOrg.id,
      code: EntitlementCode.INSTITUTE,
    },
  });
  await prisma.staffMembership.upsert({
    where: {
      userId_organisationId: {
        userId: lecturer.id,
        organisationId: lecturerOrg.id,
      },
    },
    update: { role: StaffRole.OWNER },
    create: {
      userId: lecturer.id,
      organisationId: lecturerOrg.id,
      role: StaffRole.OWNER,
    },
  });

  await prisma.user.upsert({
    where: { email: 'student@edupass.lk' },
    update: { passwordHash, name: 'QA Student' },
    create: {
      email: 'student@edupass.lk',
      passwordHash,
      name: 'QA Student',
      student: {
        create: { district: 'Colombo', school: 'QA School' },
      },
    },
  });

  const economics = await prisma.category.findUniqueOrThrow({
    where: { slug: 'economics' },
  });

  const lumina = await prisma.organisation.findUniqueOrThrow({
    where: { slug: 'lumina-academy' },
  });
  let lecturerProfile = await prisma.lecturerProfile.findFirst({
    where: { organisationId: lumina.id, name: 'Ayesha Silva' },
  });
  if (!lecturerProfile) {
    lecturerProfile = await prisma.lecturerProfile.create({
      data: {
        organisationId: lumina.id,
        name: 'Ayesha Silva',
        title: 'A/L Economics',
        subjects: ['Economics'],
        bio: 'Senior Economics lecturer at Lumina Academy.',
        status: 'active',
      },
    });
  }

  const startsAt = new Date();
  startsAt.setDate(startsAt.getDate() + 14);
  startsAt.setHours(8, 30, 0, 0);

  await prisma.bankAccount.upsert({
    where: { id: 'seed-lumina-bank' },
    update: {
      organisationId: lumina.id,
      bankName: 'Commercial Bank',
      accountName: 'Lumina Academy',
      accountNumber: '8001234567',
      branch: 'Colombo 07',
      isPlatform: false,
    },
    create: {
      id: 'seed-lumina-bank',
      organisationId: lumina.id,
      bankName: 'Commercial Bank',
      accountName: 'Lumina Academy',
      accountNumber: '8001234567',
      branch: 'Colombo 07',
      isPlatform: false,
    },
  });

  await prisma.seminar.upsert({
    where: { slug: 'al-economics-model-paper-day' },
    update: {
      title: 'A/L Economics Model Paper Day',
      status: SeminarStatus.PUBLISHED,
      checkInMode: CheckInMode.QR_GATE,
      startsAt,
    },
    create: {
      organisationId: lumina.id,
      slug: 'al-economics-model-paper-day',
      title: 'A/L Economics Model Paper Day',
      subject: 'Economics',
      level: ExamLevel.AL,
      categoryId: economics.id,
      lecturerProfileId: lecturerProfile.id,
      mode: SeminarMode.PHYSICAL,
      venue: 'Lumina Hall, Colombo 07',
      district: 'Colombo',
      startsAt,
      durationHours: 4,
      summary:
        'Full timed model paper with mark scheme walkthrough for A/L Economics.',
      description:
        'Students sit a timed paper under exam conditions, then review answers with the lecturer.',
      highlights: [
        'Timed paper',
        'Mark scheme walkthrough',
        'QR gate check-in',
      ],
      agenda: [
        { time: '08:30', title: 'Registration & QR check-in' },
        { time: '09:00', title: 'Model paper' },
        { time: '11:30', title: 'Answer discussion' },
      ],
      status: SeminarStatus.PUBLISHED,
      checkInMode: CheckInMode.QR_GATE,
      featured: true,
      language: 'Sinhala',
      ticketTypes: {
        create: [
          {
            name: 'Standard seat',
            description: 'General admission',
            priceLkr: 1500,
            capacity: 100,
            sold: 0,
          },
        ],
      },
    },
  });

  console.log(
    'Seed complete (plans, categories, QA users/seminars). Password for seeded users: Password123!',
  );
  console.log(
    'Self-serve product accounts: /register and /register/organiser. Set SEED_QA=false to skip sample users.',
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
