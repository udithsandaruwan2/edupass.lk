import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EntitlementCode } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CurrentUser,
  type AuthUser,
} from '../common/decorators/current-user.decorator';
import {
  EntitlementGuard,
  RequireEntitlement,
} from '../common/guards/entitlement.guard';
import { OrgScopeGuard } from '../common/guards/org-scope.guard';
import {
  CreateSessionDto,
  InviteStaffDto,
  MarkAttendanceDto,
} from './dto/institute.dto';
import { InstituteService } from './institute.service';

@Controller('institute')
@UseGuards(JwtAuthGuard, OrgScopeGuard, EntitlementGuard)
@RequireEntitlement(EntitlementCode.INSTITUTE)
export class InstituteController {
  constructor(private readonly institute: InstituteService) {}

  @Get('staff')
  listStaff(@Query('organisationId') organisationId: string) {
    return this.institute.listStaff(organisationId);
  }

  @Post('staff')
  inviteStaff(@Body() dto: InviteStaffDto) {
    return this.institute.inviteStaff(dto);
  }

  @Get('enrollments')
  listEnrollments(
    @Query('organisationId') organisationId: string,
    @Query('batchId') batchId?: string,
  ) {
    return this.institute.listEnrollments(organisationId, batchId);
  }

  @Get('sessions')
  listSessions(
    @Query('organisationId') organisationId: string,
    @Query('batchId') batchId?: string,
  ) {
    return this.institute.listSessions(organisationId, batchId);
  }

  @Post('sessions')
  createSession(@Body() dto: CreateSessionDto) {
    return this.institute.createSession(dto);
  }

  @Get('sessions/:id/attendance')
  getAttendance(
    @Param('id') id: string,
    @Query('organisationId') organisationId: string,
  ) {
    return this.institute.getSessionAttendance(id, organisationId);
  }

  @Post('sessions/:id/attendance')
  markAttendance(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: MarkAttendanceDto,
  ) {
    return this.institute.markAttendance(id, user.userId, dto);
  }
}
