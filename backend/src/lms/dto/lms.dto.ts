import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateModuleDto {
  @IsString()
  organisationId!: string;

  @IsString()
  batchId!: string;

  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class CreateMaterialDto {
  @IsString()
  organisationId!: string;

  @IsString()
  moduleId!: string;

  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsString()
  filePath?: string;
}

export class CreateAssignmentDto {
  @IsString()
  organisationId!: string;

  @IsString()
  moduleId!: string;

  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  dueAt?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxScore?: number;
}

export class CreateSubmissionDto {
  @IsString()
  assignmentId!: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsString()
  filePath?: string;
}

export class GradeSubmissionDto {
  @IsString()
  organisationId!: string;

  @IsInt()
  @Min(0)
  gradeScore!: number;

  @IsOptional()
  @IsString()
  gradeFeedback?: string;
}
