import { Controller, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AuthUsecase } from '../../application/usecases/auth/auth.usecase';
import { PachcaService } from '../../infrastructure/services/pachca/pachca.service';
import { HealthCheckGuard } from '../../infrastructure/common/guards/health-check.guard';

@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectQueue('pos-process')
    private readonly posProcessQueue: Queue,
    private readonly authUsecase: AuthUsecase,
    private readonly pachcaService: PachcaService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async healthCheck() {
    const checks = {
      database: await this.checkDatabase(),
      redis: await this.checkRedis(),
    };

    const allHealthy = Object.values(checks).every(
      (check) => check.status === 'healthy',
    );
    const overallStatus = allHealthy ? 'ok' : 'degraded';

    if (overallStatus === 'degraded') {
      this.sendHealthCheckNotification('general', overallStatus, checks).catch(
        (error) => {
          console.error('Failed to send health check notification:', error);
        },
      );
    }

    return {
      status: overallStatus,
      service: 'onvi-mobile-api',
      checks,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('otp')
  @UseGuards(HealthCheckGuard)
  @HttpCode(HttpStatus.OK)
  async otpHealthCheck() {
    const startTime = Date.now();
    const testPhone = '+79191854846';
    
    try {
      const otp = await this.authUsecase.sendOtp(testPhone, 'health-check');
      const latency = Date.now() - startTime;

      
      const result = {
        status: 'ok',
        service: 'onvi-mobile-api',
        check: {
          type: 'otp_send',
          status: 'healthy',
          latency,
          testPhone,
          otpCode: otp.otp,
        },
        timestamp: new Date().toISOString(),
      };

      return result;
    } catch (error) {
      const errorDetails = {
        type: 'otp_send',
        status: 'unhealthy',
        latency: Date.now() - startTime,
        testPhone,
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      this.sendHealthCheckNotification('otp', 'degraded', errorDetails).catch(
        (notificationError) => {
          console.error('Failed to send OTP health check notification:', notificationError);
        },
      );

      return {
        status: 'degraded',
        service: 'onvi-mobile-api',
        check: errorDetails,
        timestamp: new Date().toISOString(),
      };
    }
  }

  private async sendHealthCheckNotification(
    checkType: string,
    status: string,
    details: any,
  ): Promise<void> {
    await this.pachcaService.sendHealthCheckAlert(checkType, status, details);
  }

  private async checkDatabase(): Promise<{
    status: 'healthy' | 'unhealthy';
    latency?: number;
    error?: string;
  }> {
    const startTime = Date.now();
    try {
      await this.dataSource.query('SELECT 1 FROM DUAL');
      const latency = Date.now() - startTime;
      return {
        status: 'healthy',
        latency,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async checkRedis(): Promise<{
    status: 'healthy' | 'unhealthy';
    latency?: number;
    error?: string;
  }> {
    const startTime = Date.now();
    try {
      const client = await this.posProcessQueue.client;
      await client.ping();
      const latency = Date.now() - startTime;
      return {
        status: 'healthy',
        latency,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
