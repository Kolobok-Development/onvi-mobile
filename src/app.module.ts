import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { DatabaseModule } from './infrastructure/database/database.module';
import { JwtModule } from './infrastructure/services/jwt/jwt.module';
import { AccountModule } from './infrastructure/account/account.module';
import { AuthModule } from './infrastructure/auth/auth.module';
import { OtpModule } from './infrastructure/otp/otp.module';
import { DateModule } from './infrastructure/services/date/date.module';
import { EnvConfigModule } from './infrastructure/config/env-config/env-config.module';
import { BcryptModule } from './infrastructure/services/bcrypt/bcrypt.module';
import { PassportModule } from '@nestjs/passport';
import { OrderModule } from './infrastructure/order/order.module';
import { PromocodeModule } from './infrastructure/promo-code/promocode.module';
import { PaymentModule } from './infrastructure/payment/payment.module';
import { PromotionModule } from './infrastructure/promotion/promotion.module';
import { HttpModule } from '@nestjs/axios';
import { TransactionModule } from './infrastructure/transaction/transaction.module';
import { PosModule } from './infrastructure/pos/pos.module';
import { LoggerModule } from 'nestjs-pino';
import { EnvConfigService } from './infrastructure/config/env-config/env-config.service';
import { BalanceWsModule } from './websockets/balance/balance-ws.module';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerConfigModule } from './infrastructure/throttler/throttler.module';
import { TrustedHostsMiddleware } from './infrastructure/security/trusted-hosts.middleware';
import { HttpMethodFilterMiddleware } from './infrastructure/common/middleware/http-method-filter.middleware';
import { HealthController } from './api/health/health.controller';
import { HealthUseCaseModule } from './application/usecases/health/health.module';

@Module({
  imports: [
    PassportModule.register({}),
    //ThrottlerConfigModule,
    BullModule.forRootAsync({
      imports: [EnvConfigModule],
      useFactory: (env: EnvConfigService) => ({
        connection: {
          host: env.getRedisHost(),
          port: env.getRedisPort(),
          username: env.getRedisUsername(),
          password: env.getRedisPwsd(),
          keepAlive: 3000,
          connectTimeout: 6000,
          retryStrategy: (times) => Math.min(times * 100, 3000),
        },
      }),
      inject: [EnvConfigService],
    }),
    BullModule.registerQueue({
      name: 'pos-process',
    }),
    LoggerModule.forRootAsync({
      imports: [EnvConfigModule],
      inject: [EnvConfigService],
      useFactory: (env: EnvConfigService) => ({
        pinoHttp: {
          customSuccessMessage(req, res) {
            return `${req.method} [${req.url}] || ${res.statusCode} ${res.statusMessage}`;
          },
          customErrorMessage(req, res, error) {
            return `${req.method} [${req.url}] || ${res.statusCode} ${error.message}`;
          },
          // Skip logging for unsupported HTTP methods (PROPFIND, etc.) to reduce CPU usage
          autoLogging: {
            ignore: (req) => {
              const method = req.method?.toUpperCase();
              const unsupportedMethods = ['PROPFIND', 'TRACE', 'CONNECT'];
              return unsupportedMethods.includes(method);
            },
          },
          level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
          redact: {
            paths: [
              'req.headers.authorization',
              'req.headers.cookie',
              'req.body.password',
              'req.body.token',
              'req.body.refresh_token',
              'req.body.cardNumber',
              'req.body.cvv',
              'res.headers["set-cookie"]',
            ],
            censor: '[REDACTED]',
          },
          serializers: {
            req(req) {
              // Extract user context if available
              const user = (req as any).user;
              const userId = user?.clientId || user?.id || null;
              const userPhone = user?.correctPhone || user?.phone || null;

              // Extract IP address
              const ipAddress =
                req.headers['x-forwarded-for']?.toString() ||
                req.ip ||
                req.connection?.remoteAddress ||
                'unknown';

              return {
                id:
                  req.id ||
                  `req_${Date.now()}_${Math.random()
                    .toString(36)
                    .substring(2, 15)}`,
                method: req.method,
                url: req.url,
                path: req.path,
                route: req.route?.path || null,
                query: req.query || {},
                params: req.params || {},
                headers: {
                  'user-agent': req.headers['user-agent'] || null,
                  'content-type': req.headers['content-type'] || null,
                  accept: req.headers['accept'] || null,
                  'x-forwarded-for': req.headers['x-forwarded-for'] || null,
                },
                ip: ipAddress,
                user: userId
                  ? {
                      id: userId,
                      phone: userPhone,
                    }
                  : null,
                timestamp: new Date().toISOString(),
              };
            },
            res(res) {
              return {
                statusCode: res.statusCode,
                statusMessage: res.statusMessage,
                responseTime: res.responseTime || null,
                headers: {
                  'content-type': res.headers?.['content-type'] || null,
                  'content-length': res.headers?.['content-length'] || null,
                },
              };
            },
            err(err) {
              return {
                type: err.type || err.constructor?.name || 'Error',
                message: err.message || 'Unknown error',
                stack: err.stack || null,
                code: err.code || null,
                statusCode: err.statusCode || null,
                cause: err.cause || null,
                source: err.source || 'unknown',
                details: err.details || err.originalError || null,
                requestId: err.requestId || null,
                // Database-specific error details
                ...(err.code?.startsWith('NJS-') && {
                  databaseError: {
                    code: err.code,
                    message: err.message,
                    ...(err.errorNum && { errorNum: err.errorNum }),
                    ...(err.offset && { offset: err.offset }),
                  },
                }),
              };
            },
          },
          transport: {
            dedupe: true,
            targets: [
              ...(process.env.NODE_ENV === 'development'
                ? [
                    {
                      target: 'pino-pretty',
                      options: {
                        colorize: true,
                        levelFirst: true,
                        translateTime: 'SYS:dd/mm/yyyy, h:MM:ss.l o',
                      },
                      level: 'debug',
                    },
                  ]
                : [
                    {
                      target: '@logtail/pino',
                      options: {
                        sourceToken: env.getLogtailGatwayHTTPToken(), // HTTP source
                      },
                      level: 'info',
                    },
                    {
                      target: '@logtail/pino',
                      options: {
                        sourceToken: env.getLogtailGatwayRunTimeToken(), // Error source
                      },
                      level: 'error',
                    },
                  ]),
            ],
          },
        },
      }),
    }),
    HttpModule,
    DatabaseModule,
    AccountModule,
    JwtModule,
    AuthModule,
    OtpModule,
    DateModule,
    EnvConfigModule,
    BcryptModule,
    OrderModule,
    PromocodeModule,
    PaymentModule,
    PromotionModule,
    TransactionModule,
    PosModule,
    BalanceWsModule,
    HealthUseCaseModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply HTTP method filter FIRST to reject unsupported methods early (before routing)
    // This prevents PROPFIND and other WebDAV methods from consuming CPU
    consumer.apply(HttpMethodFilterMiddleware).forRoutes('*');

    // Apply the TrustedHosts middleware to webhook routes
    consumer
      .apply(TrustedHostsMiddleware)
      .forRoutes(
        { path: 'payment-webhook/webhook', method: RequestMethod.POST },
        { path: 'balance/webhook', method: RequestMethod.POST },
      );
  }
}
