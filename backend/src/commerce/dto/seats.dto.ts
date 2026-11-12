import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class SeatInputDto {
  @IsInt()
  @Min(0)
  row!: number;

  @IsInt()
  @Min(0)
  col!: number;

  @IsString()
  label!: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class UpsertVenueLayoutDto {
  @IsString()
  name!: string;

  @IsInt()
  @Min(1)
  rows!: number;

  @IsInt()
  @Min(1)
  cols!: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SeatInputDto)
  seats?: SeatInputDto[];
}

export class SeatHoldDto {
  @IsString()
  seminarId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  seatIds!: string[];
}
