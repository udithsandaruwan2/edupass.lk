import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { BillingPeriod, OrgStatus, SubscriptionStatus } from '@prisma/client';

export class UpsertPlanDto {
  @IsString()
  @MinLength(1)
  code!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(0)
  priceLkr!: number;

  @IsOptional()
  @IsEnum(BillingPeriod)
  billingPeriod?: BillingPeriod;

  @IsOptional()
  @IsInt()
  maxBatches?: number | null;

  @IsOptional()
  @IsInt()
  maxStudents?: number | null;

  @IsOptional()
  @IsInt()
  maxStaff?: number | null;

  @IsOptional()
  @IsInt()
  maxSeminarsPerMonth?: number | null;

  @IsOptional()
  @IsBoolean()
  instituteEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  seminarsEnabled?: boolean;

  @IsOptional()
  @IsNumber()
  ticketCommissionPercent?: number | null;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateSettingsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  ticketCommissionPercent?: number;

  @IsOptional()
  @IsBoolean()
  payhereEnabled?: boolean;
}

export class AssignSubscriptionDto {
  @IsString()
  planId!: string;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;
}

export class PatchOrganisationDto {
  @IsOptional()
  @IsEnum(OrgStatus)
  status?: OrgStatus;
}

export class UpgradeDto {
  @IsString()
  organisationId!: string;

  @IsString()
  planCode!: string;
}

export class PlatformSlipDto {
  @IsString()
  organisationId!: string;

  @IsString()
  invoiceId!: string;

  @IsString()
  @MinLength(3)
  slipReference!: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateBatchDto {
  @IsString()
  organisationId!: string;

  @IsString()
  @MinLength(1)
  name!: string;
}

export class CreateEnrollmentDto {
  @IsString()
  organisationId!: string;

  @IsString()
  @MinLength(1)
  displayName!: string;

  @IsOptional()
  @IsString()
  batchId?: string;

  @IsOptional()
  @IsString()
  studentUserId?: string;
}
