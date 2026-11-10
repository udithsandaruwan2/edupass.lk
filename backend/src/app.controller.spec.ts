import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return API greeting', () => {
      expect(appController.getHello()).toEqual({ message: 'edupass.lk API' });
    });
  });

  describe('health', () => {
    it('should report nestjs-fastify runtime', () => {
      expect(appController.health()).toEqual({
        status: 'ok',
        runtime: 'nestjs-fastify',
      });
    });
  });
});
