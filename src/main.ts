import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function pet() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3002);
}
pet();
