import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import {
  CheckInMode,
  ExamLevel,
  SeminarMode,
  SeminarStatus,
} from '@prisma/client';

export class TicketTypeInputDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(0)
  priceLkr!: number;

  @IsInt()
  @Min(1)
  capacity!: number;
}

export class AgendaItemDto {
  @IsString()
  time!: string;

  @IsString()
  title!: string;
}

export class CreateSeminarDto {
  @IsString()
  @MinLength(1)
  organisationId!: string;

  @IsString()
  @MinLength(8)
  title!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsString()
  @MinLength(1)
  subject!: string;

  @IsEnum(ExamLevel)
  level!: ExamLevel;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  lecturerProfileId?: string;

  @IsEnum(SeminarMode)
  mode!: SeminarMode;

  @IsString()
  @MinLength(1)
  venue!: string;

  @IsString()
  @MinLength(1)
  district!: string;

  @IsDateString()
  startsAt!: string;

  @IsNumber()
  @Min(0.5)
  durationHours!: number;

  @IsString()
  @MinLength(20)
  summary!: string;

  @IsString()
  @MinLength(1)
  description!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  highlights?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AgendaItemDto)
  agenda?: AgendaItemDto[];

  @IsOptional()
  @IsEnum(CheckInMode)
  checkInMode?: CheckInMode;

  @IsOptional()
  @IsString()
  streamJoinUrl?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TicketTypeInputDto)
  ticketTypes!: TicketTypeInputDto[];
}

export class UpdateSeminarDto {
  @IsOptional()
  @IsString()
  @MinLength(8)
  title?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsEnum(ExamLevel)
  level?: ExamLevel;

  @IsOptional()
  @IsString()
  categoryId?: string | null;

  @IsOptional()
  @IsString()
  lecturerProfileId?: string | null;

  @IsOptional()
  @IsEnum(SeminarMode)
  mode?: SeminarMode;

  @IsOptional()
  @IsString()
  venue?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.5)
  durationHours?: number;

  @IsOptional()
  @IsString()
  @MinLength(20)
  summary?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  highlights?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AgendaItemDto)
  agenda?: AgendaItemDto[];

  @IsOptional()
  @IsEnum(CheckInMode)
  checkInMode?: CheckInMode;

  @IsOptional()
  @IsString()
  streamJoinUrl?: string | null;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  image?: string | null;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TicketTypeInputDto)
  ticketTypes?: TicketTypeInputDto[];
}

export class PublishSeminarDto {
  @IsOptional()
  @IsEnum(CheckInMode)
  checkInMode?: CheckInMode;
}

export class ListSeminarsQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsEnum(ExamLevel)
  level?: ExamLevel;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsEnum(SeminarStatus)
  status?: SeminarStatus;
}

export type TicketTypeResponse = {
  id: string;
  name: string;
  description: string;
  priceLkr: number;
  capacity: number;
  sold: number;
};

export type SeminarResponse = {
  id: string;
  organisationId: string;
  slug: string;
  title: string;
  subject: string;
  level: ExamLevel;
  categoryId: string | null;
  lecturerProfileId: string | null;
  mode: SeminarMode;
  venue: string;
  district: string;
  startsAt: string;
  durationHours: number;
  summary: string;
  description: string;
  highlights: string[];
  agenda: { time: string; title: string }[];
  status: SeminarStatus;
  checkInMode: CheckInMode | null;
  streamJoinUrl: string | null;
  featured: boolean;
  language: string;
  image: string | null;
  ticketTypes: TicketTypeResponse[];
  createdAt: string;
  updatedAt: string;
};
