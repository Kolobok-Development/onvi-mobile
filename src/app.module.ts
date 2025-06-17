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
import { PartnerModule } from './infrastructure/partner/partner.module';
import { HttpModule } from '@nestjs/axios';
import { TransactionModule } from './infrastructure/transaction/transaction.module';
import { PosModule } from './infrastructure/pos/pos.module';
import { LoggerModule } from 'nestjs-pino';
import { EnvConfigService } from './infrastructure/config/env-config/env-config.service';
import { BalanceWsModule } from './websockets/balance/balance-ws.module';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerConfigModule } from './infrastructure/throttler/throttler.module';
import { TrustedHostsMiddleware } from './infrastructure/security/trusted-hosts.middleware';

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
              // req.body = req.raw;
              // req.params = req.raw.params;
              // req.query = req.raw.query;
              // req.id = req.id || req.raw.id;
              return req;
            },
            res(res) {
              return {
                statusCode: res.statusCode,
                responseTime: res.responseTime,
                headers: res.headers,
              };
            },
            err(err) {
              return {
                type: err.type || err.constructor.name,
                message: err.message,
                stack: err.stack,
                code: err.code,
                statusCode: err.statusCode,
                cause: err.cause,
                source: err.source,
                details: err.details || err.originalError,
                requestId: err.requestId,
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
    PartnerModule,
    TransactionModule,
    PosModule,
    BalanceWsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply the TrustedHosts middleware to webhook routes
    consumer
      .apply(TrustedHostsMiddleware)
      .forRoutes(
        { path: 'payment-webhook/webhook', method: RequestMethod.POST },
        { path: 'balance/webhook', method: RequestMethod.POST },
      );
  }
}
