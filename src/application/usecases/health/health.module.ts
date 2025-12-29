import { Module } from '@nestjs/common';
import { HealthCheckUseCase } from './health-check.use-case';
import { OtpHealthCheckUseCase } from './otp-health-check.use-case';
import { HealthModule } from '../../../infrastructure/services/health/health.module';
import { PachcaModule } from '../../../infrastructure/services/pachca/pachca.module';
import { AuthModule } from '../../../infrastructure/auth/auth.module';

@Module({
  imports: [HealthModule, PachcaModule, AuthModule],
  providers: [HealthCheckUseCase, OtpHealthCheckUseCase],
  exports: [HealthCheckUseCase, OtpHealthCheckUseCase],
})
export class HealthUseCaseModule {}

