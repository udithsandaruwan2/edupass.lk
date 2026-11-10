import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): { message: string } {
    return { message: this.appService.getHello() };
  }

  @Get('health')
  health(): { status: string; runtime: string } {
    return { status: 'ok', runtime: 'nestjs-fastify' };
  }
}
