import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ClassAttendanceStatus, StaffRole } from '@prisma/client';

export class InviteStaffDto {
  @IsString()
  organisationId!: string;

  @IsString()
  @MinLength(3)
  email!: string;

  @IsOptional()
  @IsEnum(StaffRole)
  role?: StaffRole;
}

export class CreateSessionDto {
  @IsString()
  organisationId!: string;

  @IsString()
  batchId!: string;

  @IsString()
  @MinLength(1)
  title!: string;

  @IsDateString()
  startsAt!: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class AttendanceMarkDto {
  @IsString()
  enrollmentId!: string;

  @IsEnum(ClassAttendanceStatus)
  status!: ClassAttendanceStatus;

  @IsOptional()
  @IsString()
  note?: string;
}

export class MarkAttendanceDto {
  @IsString()
  organisationId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AttendanceMarkDto)
  marks!: AttendanceMarkDto[];
}
