import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrgScopeGuard } from '../common/guards/org-scope.guard';
import { CreateLecturerDto, UpdateLecturerDto } from './dto/lecturer.dto';
import { LecturersService } from './lecturers.service';

@Controller('organiser/lecturers')
@UseGuards(JwtAuthGuard, OrgScopeGuard)
export class OrganiserLecturersController {
  constructor(private readonly lecturers: LecturersService) {}

  @Get()
  list(@Query('organisationId') organisationId: string) {
    return this.lecturers.listForOrganisation(organisationId);
  }

  @Post()
  create(@Body() dto: CreateLecturerDto) {
    return this.lecturers.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Query('organisationId') organisationId: string,
    @Body() dto: UpdateLecturerDto,
  ) {
    return this.lecturers.update(id, organisationId, dto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Query('organisationId') organisationId: string,
  ) {
    return this.lecturers.remove(id, organisationId);
  }
}
