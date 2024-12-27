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
import {PartnerModule} from "./infrastructure/partner/partner.module";
import {HttpModule} from "@nestjs/axios";

@Module({
  imports: [
    PassportModule.register({}),
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
