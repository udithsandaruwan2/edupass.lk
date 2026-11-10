import { Module } from '@nestjs/common';
import { EntitlementGuard } from '../common/guards/entitlement.guard';
import { InstituteController } from './institute.controller';
import { InstituteService } from './institute.service';

@Module({
  controllers: [InstituteController],
  providers: [InstituteService, EntitlementGuard],
  exports: [InstituteService],
})
export class InstituteModule {}
