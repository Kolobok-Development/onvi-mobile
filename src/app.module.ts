import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infrastructure/database/database.module';
import { JwtModule } from './infrastructure/services/jwt/jwt.module';
import { AccountModule } from './infrastructure/account/account.module';
import { AuthModule } from './infrastructure/auth/auth.module';
import { OtpModule } from './infrastructure/otp/otp.module';
import { DateModule } from './infrastructure/services/date/date.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    DatabaseModule,
    AccountModule,
    JwtModule,
    AuthModule,
    OtpModule,
    DateModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
