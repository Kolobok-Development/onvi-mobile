import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infrastructure/database/database.module';
import { JwtModule } from './infrastructure/services/jwt/jwt.module';
import { AccountModule } from './infrastructure/account/account.module';
import { AuthModule } from './infrastructure/auth/auth.module';
import { OtpModule } from './infrastructure/otp/otp.module';
import { DateModule } from './infrastructure/services/date/date.module';
import { EnvConfigModule } from './infrastructure/config/env-config/env-config.module';
import { BcryptModule } from './infrastructure/services/bcrypt/bcrypt.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './infrastructure/common/strategies/local.strategy';
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

@Module({
  imports: [
    PassportModule.register({}),
    LoggerModule.forRootAsync({
      imports: [EnvConfigModule],
      inject: [EnvConfigService],
      useFactory: (env: EnvConfigService) => ({
        pinoHttp: {
          customSuccessMessage(req, res) {
            return `${req.method} [${req.url}] || ${res.statusMessage}`;
          },
          customErrorMessage(req, res, error) {
            return `${req.method} [${req.url}] || ${error.message}`;
          },
          serializers: {
            req(req) {
              req.body = req.raw.body;
              return req;
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
