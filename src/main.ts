import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationError, ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './infrastructure/common/interceptors/response.interceptor';
import { AllExceptionFilter } from './infrastructure/common/filters/exception.filter';
import { ValidationException } from './infrastructure/common/exceptions/validation.exception';
import { Logger } from 'nestjs-pino';
import * as process from 'node:process';
import helmet from 'helmet';
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
  // Store app instance for logger access in interceptor
  ResponseInterceptor.setAppInstance(app);
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionFilter(logger));
  app.setGlobalPrefix('/api/v2');

  // Trust proxy: when off (default), use socket.remoteAddress only; when on, use req.ip from proxy
  const trustProxyRaw = process.env.TRUST_PROXY;
  let trustProxy: boolean | number = false;
  if (trustProxyRaw === '1' || trustProxyRaw === 'true') trustProxy = true;
  else if (trustProxyRaw !== undefined && trustProxyRaw !== '') {
    const n = Number(trustProxyRaw);
    if (!Number.isNaN(n)) trustProxy = n;
  }
  app.set('trust proxy', trustProxy);

  // Apply Helmet security middleware with custom config
  app.use(helmet(helmetConfig));

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

  // Enable graceful shutdown
  process.on('SIGTERM', async () => {
    logger.log('SIGTERM signal received: closing HTTP server');
    await app.close();
  });

  process.on('SIGINT', async () => {
    logger.log('SIGINT signal received: closing HTTP server');
    await app.close();
  });
}
bootstrap();
