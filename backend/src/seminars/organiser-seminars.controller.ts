import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrgScopeGuard } from '../common/guards/org-scope.guard';
import {
  CreateSeminarDto,
  PublishSeminarDto,
  UpdateSeminarDto,
} from './dto/seminar.dto';
import { SeminarsService } from './seminars.service';

@Controller('organiser/seminars')
@UseGuards(JwtAuthGuard, OrgScopeGuard)
export class OrganiserSeminarsController {
  constructor(private readonly seminars: SeminarsService) {}

  @Get()
  list(@Query('organisationId') organisationId: string) {
    return this.seminars.listForOrganisation(organisationId);
  }

  @Get(':id')
  get(
    @Param('id') id: string,
    @Query('organisationId') organisationId: string,
  ) {
    return this.seminars.getForOrganisation(id, organisationId);
  }

  @Post()
  create(@Body() dto: CreateSeminarDto) {
    return this.seminars.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Query('organisationId') organisationId: string,
    @Body() dto: UpdateSeminarDto,
  ) {
    return this.seminars.update(id, organisationId, dto);
  }

  @Post(':id/publish')
  publish(
    @Param('id') id: string,
    @Query('organisationId') organisationId: string,
    @Body() dto: PublishSeminarDto,
  ) {
    return this.seminars.publish(id, organisationId, dto);
  }

  @Post(':id/cancel')
  cancel(
    @Param('id') id: string,
    @Query('organisationId') organisationId: string,
  ) {
    return this.seminars.cancel(id, organisationId);
  }
}
