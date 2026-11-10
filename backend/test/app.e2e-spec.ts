import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    app.setGlobalPrefix('api');
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  it('/api (GET)', () => {
    return app
      .inject({ method: 'GET', url: '/api' })
      .then((result) => {
        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.payload)).toEqual({
          message: 'edupass.lk API',
        });
      });
  });

  it('/api/health (GET)', () => {
    return app
      .inject({ method: 'GET', url: '/api/health' })
      .then((result) => {
        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.payload)).toEqual({
          status: 'ok',
          runtime: 'nestjs-fastify',
        });
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
