import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationError, ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './infrastructure/common/interceptors/response.interceptor';
import { AllExceptionFilter } from './infrastructure/common/filters/exception.filter';
import { ValidationException } from './infrastructure/common/exceptions/validation.exception';
import { Logger } from 'nestjs-pino';
import * as process from 'node:process';
//import * as helmet from 'helmet';
import { helmetConfig } from './infrastructure/security/helmet.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        return new ValidationException(errors);
      },
    }),
  );
  const logger = app.get(Logger);
  app.useLogger(logger);
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionFilter(logger));
  app.setGlobalPrefix('/api/v2');

  // Apply Helmet security middleware with custom config
  //app.use(helmet.default(helmetConfig));

  // Enable CORS for mobile app domains
  /*app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://onvi-mobile.com', 'https://api.onvi-mobile.com']
        : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    maxAge: 86400, // 24 hours in seconds
  });*/
  await app.listen(process.env.PORT);
}
bootstrap();
