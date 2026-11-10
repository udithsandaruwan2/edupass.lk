import { IsOptional, IsString, MinLength } from 'class-validator';

export class CheckInDto {
  @IsString()
  @MinLength(1)
  organisationId!: string;

  @IsString()
  @MinLength(1)
  seminarId!: string;

  @IsString()
  @MinLength(1)
  code!: string;
}
