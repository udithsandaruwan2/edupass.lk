import { Module } from '@nestjs/common';
import { EntitlementGuard } from '../common/guards/entitlement.guard';
import { StudentTuitionController } from './student-tuition.controller';
import { TuitionController } from './tuition.controller';
import { TuitionService } from './tuition.service';

@Module({
  controllers: [TuitionController, StudentTuitionController],
  providers: [TuitionService, EntitlementGuard],
  exports: [TuitionService],
})
export class TuitionModule {}
