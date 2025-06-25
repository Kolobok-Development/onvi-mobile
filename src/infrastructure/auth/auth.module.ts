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
import { JwtRefreshStrategy } from '../common/strategies/jwt-refresh.strategy';
import { JwtStrategy } from '../common/strategies/jwt.strategy';
import { WsJwtStrategy } from '../common/strategies/jwt-ws.strategy';
import { WsAuthGuard } from '../common/guards/jws-ws.guard';
import { PromocodeModule } from '../promo-code/promocode.module';

@Module({
  imports: [
    JwtModule,
    AccountModule,
    OtpModule,
    DateModule,
    EnvConfigModule,
    BcryptModule,
    PromocodeModule
  ],
  controllers: [AuthController],
  providers: [
    AuthUsecase,
    JwtProvider,
    LocalStrategy,
    JwtRefreshStrategy,
    JwtStrategy,
    WsJwtStrategy,
    WsAuthGuard,
  ],
  exports: [AuthUsecase, WsAuthGuard],
})
export class AuthModule {}
