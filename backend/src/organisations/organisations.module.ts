import { Module } from '@nestjs/common';
import { OrganisationsController } from './organisations.controller';
import { OrgScopeGuard } from '../common/guards/org-scope.guard';

@Module({
  controllers: [OrganisationsController],
  providers: [OrgScopeGuard],
})
export class OrganisationsModule {}
