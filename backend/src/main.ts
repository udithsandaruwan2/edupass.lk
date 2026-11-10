import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { findAvailablePort } from './utils/find-available-port';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const origins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({
    origin: origins.length ? origins : true,
    credentials: true,
  });

  const preferred = Number(process.env.PORT ?? 3000);
  const port = await findAvailablePort(preferred);
  await app.listen(port, '0.0.0.0');

  const logger = new Logger('Bootstrap');
  if (port !== preferred) {
    logger.warn(`Port ${preferred} is in use — listening on ${port} instead`);
  }
  logger.log(`API ready at http://localhost:${port}/api/health`);
}

void bootstrap();
