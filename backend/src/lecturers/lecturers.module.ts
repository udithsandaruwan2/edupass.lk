import { Module } from '@nestjs/common';
import { LecturersService } from './lecturers.service';
import { OrganiserLecturersController } from './organiser-lecturers.controller';
import { PublicLecturersController } from './public-lecturers.controller';

@Module({
  controllers: [OrganiserLecturersController, PublicLecturersController],
  providers: [LecturersService],
  exports: [LecturersService],
})
export class LecturersModule {}
