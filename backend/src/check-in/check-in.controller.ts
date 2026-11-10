import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CurrentUser,
  type AuthUser,
} from '../common/decorators/current-user.decorator';
import { OrgScopeGuard } from '../common/guards/org-scope.guard';
import { CheckInService } from './check-in.service';
import { CheckInDto } from './dto/check-in.dto';

@Controller('organiser')
@UseGuards(JwtAuthGuard, OrgScopeGuard)
export class CheckInController {
  constructor(private readonly checkIn: CheckInService) {}

  @Post('check-in')
  @HttpCode(200)
  scan(@CurrentUser() user: AuthUser, @Body() dto: CheckInDto) {
    return this.checkIn.checkIn(user.userId, dto);
  }

  @Get('seminars/:id/attendance')
  attendance(
    @Param('id') id: string,
    @Query('organisationId') organisationId: string,
  ) {
    return this.checkIn.attendance(id, organisationId);
  }
}
