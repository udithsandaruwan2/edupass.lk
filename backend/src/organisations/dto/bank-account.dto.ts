import { IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class UpsertBankAccountDto {
  @IsString()
  @MinLength(2)
  bankName!: string;

  @IsString()
  @MinLength(2)
  accountName!: string;

  @IsString()
  @Matches(/^\d{8,20}$/, { message: 'accountNumber must be 8–20 digits' })
  accountNumber!: string;

  @IsOptional()
  @IsString()
  branch?: string;
}
