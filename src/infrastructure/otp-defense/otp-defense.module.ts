import { Module } from '@nestjs/common';
import { EnvConfigModule } from '../config/env-config/env-config.module';
import { RateLimiterService } from './rate-limiter.service';
import { OtpDefenseService } from './otp-defense.service';

@Module({
  imports: [EnvConfigModule],
  providers: [RateLimiterService, OtpDefenseService],
  exports: [RateLimiterService, OtpDefenseService],
})
export class OtpDefenseModule {}
