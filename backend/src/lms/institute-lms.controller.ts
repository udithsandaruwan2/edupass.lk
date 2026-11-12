import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { StaffRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CurrentUser,
  type AuthUser,
} from '../common/decorators/current-user.decorator';
import { OrgScopeGuard } from '../common/guards/org-scope.guard';
import {
  RequireStaffRoles,
  StaffRoleGuard,
} from '../common/guards/staff-role.guard';
import {
  CreateAssignmentDto,
  CreateMaterialDto,
  CreateModuleDto,
  GradeSubmissionDto,
} from './dto/lms.dto';
import { LmsService } from './lms.service';

@Controller('institute/lms')
@UseGuards(JwtAuthGuard, OrgScopeGuard, StaffRoleGuard)
@RequireStaffRoles(StaffRole.OWNER, StaffRole.ADMIN, StaffRole.TEACHER)
export class InstituteLmsController {
  constructor(private readonly lms: LmsService) {}

  @Post('modules')
  createModule(@Body() dto: CreateModuleDto) {
    return this.lms.createModule(dto);
  }

  @Post('materials')
  createMaterial(@Body() dto: CreateMaterialDto) {
    return this.lms.createMaterial(dto);
  }

  @Post('assignments')
  createAssignment(@Body() dto: CreateAssignmentDto) {
    return this.lms.createAssignment(dto);
  }

  @Patch('submissions/:id/grade')
  grade(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: GradeSubmissionDto,
  ) {
    return this.lms.gradeSubmission(id, user.userId, dto);
  }
}
