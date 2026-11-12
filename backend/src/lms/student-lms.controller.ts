import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CurrentUser,
  type AuthUser,
} from '../common/decorators/current-user.decorator';
import { CreateSubmissionDto } from './dto/lms.dto';
import { LmsService } from './lms.service';

@Controller('student/lms')
@UseGuards(JwtAuthGuard)
export class StudentLmsController {
  constructor(private readonly lms: LmsService) {}

  @Get('modules')
  modules(
    @CurrentUser() user: AuthUser,
    @Query('batchId') batchId?: string,
  ) {
    return this.lms.listModulesForStudent(user.userId, batchId);
  }

  @Post('submissions')
  submit(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateSubmissionDto,
  ) {
    return this.lms.submitAssignment(user.userId, dto);
  }

  @Get('grades')
  grades(@CurrentUser() user: AuthUser) {
    return this.lms.listGradesForStudent(user.userId);
  }
}
