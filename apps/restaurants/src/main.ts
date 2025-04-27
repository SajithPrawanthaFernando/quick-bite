import { NestFactory } from '@nestjs/core';
import { AppModule } from './restaurants.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';

async function bootstrap() {
  // Load environment variables
  dotenv.config();

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  });

  // Enable validation
  app.useGlobalPipes(new ValidationPipe());

  // Swagger configuration
  const options = new DocumentBuilder()
    .setTitle('Restaurant Platform API')
    .setDescription('The restaurant platform API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  // Start the application
  await app.listen(process.env.PORT || 3003);
  console.log(
    `Application is running on: http://localhost:${process.env.PORT || 3003}`,
  );
  console.log(
    `Swagger documentation is available at: http://localhost:${process.env.PORT || 3003}/api`,
  );
}
bootstrap();
