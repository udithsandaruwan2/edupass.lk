import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateTuitionFeePlanDto {
  @IsString()
  organisationId!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  amountLkr!: number;
}

export class CreateTuitionInvoiceDto {
  @IsString()
  organisationId!: string;

  @IsString()
  enrollmentId!: string;

  @IsOptional()
  @IsString()
  feePlanId?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  amountLkr?: number;
}

export class RecordCashPaymentDto {
  @IsString()
  organisationId!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  amountLkr?: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class RecordTuitionSlipDto {
  @IsString()
  organisationId!: string;

  @IsString()
  @MinLength(3)
  slipReference!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  amountLkr?: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class ReviewTuitionSlipDto {
  @IsString()
  organisationId!: string;

  @IsIn(['approve', 'reject'])
  decision!: 'approve' | 'reject';

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

export class StudentTuitionSlipDto {
  @IsString()
  invoiceId!: string;

  @IsString()
  @MinLength(3)
  slipReference!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  amountLkr?: number;

  @IsOptional()
  @IsString()
  note?: string;
}
