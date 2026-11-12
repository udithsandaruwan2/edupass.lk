import { Controller, Get } from '@nestjs/common';
import { CmsService } from './cms.service';

@Controller('cms')
export class CmsController {
  constructor(private readonly cms: CmsService) {}

  @Get('banners')
  banners() {
    return this.cms.listBanners();
  }

  @Get('faqs')
  faqs() {
    return this.cms.listFaqs();
  }
}
