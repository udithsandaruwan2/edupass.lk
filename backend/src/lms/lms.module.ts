import { Module } from '@nestjs/common';
import { StaffRoleGuard } from '../common/guards/staff-role.guard';
import { InstituteLmsController } from './institute-lms.controller';
import { LmsService } from './lms.service';
import { StorageService } from './storage.service';
import { StudentLmsController } from './student-lms.controller';

@Module({
  controllers: [InstituteLmsController, StudentLmsController],
  providers: [LmsService, StorageService, StaffRoleGuard],
  exports: [LmsService],
})
export class LmsModule {}
