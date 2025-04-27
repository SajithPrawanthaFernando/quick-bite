import { NestFactory } from '@nestjs/core';
import { AppModule } from './ordermain.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log('MONGO_URI from process.env:', process.env.MONGO_URI);
  console.log('App is about to listen on port 3008');
  await app.listen(process.env.PORT ?? 3008);
  console.log('App is now listening on port 3008');
}
bootstrap();
