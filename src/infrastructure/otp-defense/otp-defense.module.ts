import { Module } from '@nestjs/common';
import { EnvConfigModule } from '../config/env-config/env-config.module';
import { RateLimiterService } from './rate-limiter.service';
import { OtpDefenseService } from './otp-defense.service';
import { SubnetBlockConfigService } from './subnet-block-config.service';

@Module({
  imports: [EnvConfigModule],
  providers: [RateLimiterService, OtpDefenseService, SubnetBlockConfigService],
  exports: [RateLimiterService, OtpDefenseService, SubnetBlockConfigService],
})
export class OtpDefenseModule {}
