import { Controller, Get, Param, Query } from '@nestjs/common';
import { ListSeminarsQueryDto } from './dto/seminar.dto';
import { SeminarsService } from './seminars.service';

@Controller()
export class CatalogueController {
  constructor(private readonly seminars: SeminarsService) {}

  @Get('categories')
  listCategories() {
    return this.seminars.listCategories();
  }

  @Get('seminars')
  listSeminars(@Query() query: ListSeminarsQueryDto) {
    return this.seminars.listPublic(query);
  }

  @Get('seminars/:slug')
  getSeminar(@Param('slug') slug: string) {
    return this.seminars.getBySlug(slug);
  }
}
