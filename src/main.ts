import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationError, ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './infrastructure/common/interceptors/response.interceptor';
import { AllExceptionFilter } from './infrastructure/common/filters/exception.filter';
import { ValidationException } from './infrastructure/common/exceptions/validation.exception';
import { Logger } from 'nestjs-pino';
import * as process from 'node:process';

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
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionFilter());
  app.setGlobalPrefix('/api/v2');
  app.useLogger(app.get(Logger));
  await app.listen(process.env.PORT, () => {
    console.log(`ONVI listening on port ${process.env.PORT}`);
    console.log(process.env.NODE_ENV);
  });
}
bootstrap();
