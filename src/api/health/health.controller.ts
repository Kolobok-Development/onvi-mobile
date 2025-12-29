import { Controller, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { HealthCheckGuard } from '../../infrastructure/common/guards/health-check.guard';
import { HealthCheckUseCase } from '../../application/usecases/health/health-check.use-case';
import { OtpHealthCheckUseCase } from '../../application/usecases/health/otp-health-check.use-case';

@Controller('health')
export class HealthController {
  constructor(
    private readonly healthCheckUseCase: HealthCheckUseCase,
    private readonly otpHealthCheckUseCase: OtpHealthCheckUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async healthCheck() {
    return this.healthCheckUseCase.execute();
  }

  @Get('otp')
  @UseGuards(HealthCheckGuard)
  @HttpCode(HttpStatus.OK)
  async otpHealthCheck() {
    return this.otpHealthCheckUseCase.execute();
  }
}
