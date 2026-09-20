import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  // Every endpoint — including the public /w/:slug view — lives under /v1 per the spec's
  // single API base; only the bare health-check root is excluded.
  app.setGlobalPrefix('v1', {
    exclude: ['/'],
  });

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
