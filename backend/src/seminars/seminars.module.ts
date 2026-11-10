import { Module } from '@nestjs/common';
import { CatalogueController } from './catalogue.controller';
import { OrganiserSeminarsController } from './organiser-seminars.controller';
import { SeminarsService } from './seminars.service';

@Module({
  controllers: [CatalogueController, OrganiserSeminarsController],
  providers: [SeminarsService],
  exports: [SeminarsService],
})
export class SeminarsModule {}
