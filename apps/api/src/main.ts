import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigin = process.env.WEB_APP_URL ?? 'http://localhost:3000';

  app.enableCors({
    origin: allowedOrigin,
    credentials: true,
  });

  const port = process.env.PORT ?? 3010;
  await app.listen(port);
  console.log(`API listening on port ${port}`);
}
bootstrap();
