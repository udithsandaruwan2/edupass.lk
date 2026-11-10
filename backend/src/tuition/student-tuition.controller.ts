import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CurrentUser,
  type AuthUser,
} from '../common/decorators/current-user.decorator';
import { StudentTuitionSlipDto } from './dto/tuition.dto';
import { TuitionService } from './tuition.service';

@Controller('student/tuition')
@UseGuards(JwtAuthGuard)
export class StudentTuitionController {
  constructor(private readonly tuition: TuitionService) {}

  @Get('invoices')
  balance(@CurrentUser() user: AuthUser) {
    return this.tuition.studentBalance(user.userId);
  }

  @Post('slips')
  uploadSlip(
    @CurrentUser() user: AuthUser,
    @Body() dto: StudentTuitionSlipDto,
  ) {
    return this.tuition.studentUploadSlip(user.userId, dto);
  }
}
