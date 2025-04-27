import { NestFactory } from '@nestjs/core';
import { AppModule } from './ordermain.module';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useLogger(app.get(Logger));
  app.use(cookieParser());
  console.log('MONGO_URI from process.env:', process.env.MONGO_URI);
  console.log('App is about to listen on port 3008');
  await app.listen(process.env.PORT ?? 3008);
  console.log('App is now listening on port 3008');
}
bootstrap();
