import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import {
  EntitlementCode,
  EntitlementStatus,
  GlobalRole,
  OrgStatus,
  OrgType,
  StaffRole,
  SubscriptionStatus,
} from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  ChangePasswordDto,
  ContactDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterInstitutionDto,
  RegisterLecturerDto,
  RegisterStudentDto,
  ResetPasswordDto,
  UpdateProfileDto,
} from './dto/auth.dto';

type ResetEntry = { code: string; expiresAt: number };

const RESET_TTL_MS = 15 * 60 * 1000;

function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  return base || 'org';
}

@Injectable()
export class AuthService {
  private readonly resetCodes = new Map<string, ResetEntry>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
  ) {}

  async registerStudent(dto: RegisterStudentDto) {
    await this.ensureUniqueEmail(dto.email);
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        name: dto.name,
        globalRole: GlobalRole.STUDENT,
        student: {
          create: {
            district: dto.district,
            school: dto.school,
          },
        },
      },
    });
    void this.mail.welcome(user.email, user.name, 'student');
    return this.issueTokens(user.id, user.email, false);
  }

  async registerInstitution(dto: RegisterInstitutionDto) {
    await this.ensureUniqueEmail(dto.email);
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const freePlan = await this.prisma.subscriptionPlan.findUnique({
      where: { code: 'free' },
    });
    if (!freePlan) {
      throw new ConflictException('Free plan not seeded');
    }

    const slug = await this.uniqueSlug(dto.organisationName);
    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
          name: dto.name,
          globalRole: GlobalRole.STUDENT,
        },
      });
      const org = await tx.organisation.create({
        data: {
          name: dto.organisationName,
          slug,
          type: OrgType.INSTITUTE,
          status: OrgStatus.ACTIVE,
          entitlements: {
            create: [
              { code: EntitlementCode.SEMINARS, status: EntitlementStatus.ACTIVE },
              { code: EntitlementCode.INSTITUTE, status: EntitlementStatus.ACTIVE },
            ],
          },
          memberships: {
            create: { userId: created.id, role: StaffRole.OWNER },
          },
          subscriptions: {
            create: {
              planId: freePlan.id,
              status: SubscriptionStatus.ACTIVE,
            },
          },
        },
      });
      return { user: created, organisationId: org.id };
    });

    void this.mail.welcome(user.user.email, user.user.name, 'institution');
    return this.issueTokens(user.user.id, user.user.email, false);
  }

  async registerLecturer(dto: RegisterLecturerDto) {
    await this.ensureUniqueEmail(dto.email);
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const orgName = dto.organisationName?.trim() || `${dto.name} Seminars`;
    const slug = await this.uniqueSlug(orgName);

    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
          name: dto.name,
          globalRole: GlobalRole.STUDENT,
        },
      });
      await tx.organisation.create({
        data: {
          name: orgName,
          slug,
          type: OrgType.INDIVIDUAL_LECTURER,
          status: OrgStatus.ACTIVE,
          entitlements: {
            create: [
              { code: EntitlementCode.SEMINARS, status: EntitlementStatus.ACTIVE },
            ],
          },
          memberships: {
            create: { userId: created.id, role: StaffRole.OWNER },
          },
        },
      });
      return created;
    });

    void this.mail.welcome(user.email, user.name, 'lecturer');
    return this.issueTokens(user.id, user.email, false);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueTokens(user.id, user.email, user.isPlatformAdmin);
  }

  /** Always returns ok to avoid email enumeration. */
  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) {
      const code = String(randomInt(100000, 999999));
      this.resetCodes.set(email, {
        code,
        expiresAt: Date.now() + RESET_TTL_MS,
      });
      void this.mail.passwordReset(user.email, user.name, code);
    }
    return { ok: true as const };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const email = dto.email.toLowerCase();
    const entry = this.resetCodes.get(email);
    if (!entry || entry.expiresAt < Date.now() || entry.code !== dto.code.trim()) {
      throw new BadRequestException('Invalid or expired reset code');
    }
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new BadRequestException('Invalid or expired reset code');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
    this.resetCodes.delete(email);
    return { ok: true as const };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    const ok = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('New password must be different');
    }
    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    return { ok: true as const };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name ? { name: dto.name.trim() } : {}),
        student: {
          upsert: {
            create: {
              school: dto.school,
              district: dto.district,
              stream: dto.stream,
              examYear: dto.examYear,
            },
            update: {
              ...(dto.school !== undefined ? { school: dto.school } : {}),
              ...(dto.district !== undefined ? { district: dto.district } : {}),
              ...(dto.stream !== undefined ? { stream: dto.stream } : {}),
              ...(dto.examYear !== undefined ? { examYear: dto.examYear } : {}),
            },
          },
        },
      },
    });
    return this.me(userId);
  }

  async contact(dto: ContactDto) {
    const support =
      process.env.SUPPORT_EMAIL ?? 'support@edupass.lk';
    await this.mail.send({
      to: support,
      subject: `[EduPass contact · ${dto.topic}] from ${dto.name}`,
      text: `From: ${dto.name} <${dto.email}>\nTopic: ${dto.topic}\n\n${dto.message}`,
    });
    await this.mail.send({
      to: dto.email.toLowerCase(),
      subject: 'We received your EduPass message',
      text: `Hi ${dto.name},\n\nThanks for contacting EduPass about "${dto.topic}". Our team will reply within one working day.\n\n— EduPass`,
    });
    return { ok: true as const };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        student: true,
        memberships: {
          include: {
            organisation: {
              include: {
                entitlements: true,
                subscriptions: {
                  where: { status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] } },
                  orderBy: { createdAt: 'desc' },
                  take: 1,
                  include: { plan: true },
                },
              },
            },
          },
        },
      },
    });

    const settings = await this.prisma.platformSettings.findUnique({
      where: { id: 'default' },
    });

    const memberships = user.memberships.map((m) => {
      const sub = m.organisation.subscriptions[0];
      const planCommission = sub?.plan.ticketCommissionPercent;
      const commissionPercent = Number(
        planCommission ?? settings?.ticketCommissionPercent ?? 5,
      );
      return {
        organisationId: m.organisationId,
        role: m.role,
        organisation: {
          id: m.organisation.id,
          name: m.organisation.name,
          slug: m.organisation.slug,
          type: m.organisation.type,
          status: m.organisation.status,
        },
        entitlements: m.organisation.entitlements.map((e) => ({
          code: e.code,
          status: e.status,
        })),
        plan: sub
          ? {
              code: sub.plan.code,
              name: sub.plan.name,
              status: sub.status,
            }
          : null,
        commissionPercent,
      };
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isPlatformAdmin: user.isPlatformAdmin,
      globalRole: user.globalRole,
      student: user.student
        ? {
            examYear: user.student.examYear,
            school: user.student.school,
            district: user.student.district,
            stream: user.student.stream,
          }
        : null,
      memberships,
      platform: {
        ticketCommissionPercent: Number(settings?.ticketCommissionPercent ?? 5),
        payhereEnabled: settings?.payhereEnabled ?? false,
      },
    };
  }

  private async ensureUniqueEmail(email: string) {
    const existing = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }
  }

  private async uniqueSlug(name: string): Promise<string> {
    const base = slugify(name);
    let slug = base;
    let i = 1;
    while (await this.prisma.organisation.findUnique({ where: { slug } })) {
      slug = `${base}-${i++}`;
    }
    return slug;
  }

  private async issueTokens(
    userId: string,
    email: string,
    isPlatformAdmin: boolean,
  ) {
    const accessToken = await this.jwt.signAsync({
      sub: userId,
      email,
      isPlatformAdmin,
    });
    return {
      accessToken,
      tokenType: 'Bearer',
      user: await this.me(userId),
    };
  }
}
