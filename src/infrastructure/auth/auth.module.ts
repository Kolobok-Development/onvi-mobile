import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthUsecase } from '../../application/usecases/auth/auth.usecase';
import { AccountModule } from '../account/account.module';
import { BcryptModule } from '../services/bcrypt/bcrypt.module';
import { DateModule } from '../services/date/date.module';
import { OtpModule } from '../otp/otp.module';
import { EnvConfigModule } from '../config/env-config/env-config.module';
import { JwtProvider } from '../services/jwt/jwt.provider';
import { AuthController } from '../../api/auth/auth.controller';
import { LocalStrategy } from '../common/strategies/local.strategy';

@Module({
  imports: [
    JwtModule,
    AccountModule,
    OtpModule,
    DateModule,
    EnvConfigModule,
    BcryptModule,
  ],
  controllers: [AuthController],
  providers: [AuthUsecase, JwtProvider, LocalStrategy],
  exports: [AuthUsecase],
})
export class AuthModule {}
