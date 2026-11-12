import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CommercePaymentMethod } from '@prisma/client';

export class CheckoutLineDto {
  @IsString()
  ticketTypeId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attendeeNames?: string[];
}

export class CheckoutBuyerDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  phone!: string;
}

export class CheckoutDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CheckoutLineDto)
  lines!: CheckoutLineDto[];

  @ValidateNested()
  @Type(() => CheckoutBuyerDto)
  buyer!: CheckoutBuyerDto;

  @IsOptional()
  @IsEnum(CommercePaymentMethod)
  paymentMethod?: CommercePaymentMethod;

  /** Reserved seat IDs — holds must belong to the checkout student. */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  seatIds?: string[];
}

export class UploadSlipDto {
  @IsString()
  orderId!: string;

  @IsString()
  @MinLength(3)
  slipReference!: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export enum SlipReviewAction {
  APPROVE = 'approve',
  REJECT = 'reject',
}

export class ReviewSlipDto {
  @IsEnum(SlipReviewAction)
  action!: SlipReviewAction;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class CreateRefundDto {
  @IsString()
  orderId!: string;

  @IsString()
  @MinLength(5)
  reason!: string;
}

export class ReviewRefundDto {
  @IsEnum(SlipReviewAction)
  action!: SlipReviewAction;
}
