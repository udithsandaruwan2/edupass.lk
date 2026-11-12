import { Controller, Get, Param } from '@nestjs/common';
import { LecturersService } from './lecturers.service';

@Controller('lecturers')
export class PublicLecturersController {
  constructor(private readonly lecturers: LecturersService) {}

  @Get()
  list() {
    return this.lecturers.listPublic();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.lecturers.getPublic(id);
  }
}
