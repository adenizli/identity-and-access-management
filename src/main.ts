import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CoreModule } from './core.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

/**
 * Bootstraps the NestJS application, sets up Swagger, global pipes, CORS, and starts the server.
 */
async function bootstrap() {
  const app = await NestFactory.create(CoreModule);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Support Service API')
    .setDescription('The Support Service API documentation')
    .setVersion('1.0')
    .addTag('support-service')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const fs = require('fs');
  fs.writeFileSync('./swagger.json', JSON.stringify(document, null, 2));

  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: {
      docExpansion: 'none', // Collapse all sections by default
      filter: true, // Enable filtering
      displayRequestDuration: true, // Display request duration
    },
  });

  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
