import { Injectable, Inject } from '@nestjs/common';
import { IHealthCheckRepository } from '../../../domain/health/adapter/health-check-repository.interface';
import { INotificationService } from '../../../domain/health/adapter/notification-service.interface';
import { Logger } from 'nestjs-pino';

@Injectable()
export class HealthCheckUseCase {
  constructor(
    private readonly healthCheckRepository: IHealthCheckRepository,
    private readonly notificationService: INotificationService,
    @Inject(Logger) private readonly logger: Logger,
  ) {}

  async execute(): Promise<{
    status: string;
    service: string;
    checks: {
      database: {
        status: 'healthy' | 'unhealthy';
        latency?: number;
        error?: string;
      };
      redis: {
        status: 'healthy' | 'unhealthy';
        latency?: number;
        error?: string;
      };
    };
    timestamp: string;
  }> {
    const checks = {
      database: await this.healthCheckRepository.checkDatabase(),
      redis: await this.healthCheckRepository.checkRedis(),
    };

    const allHealthy = Object.values(checks).every(
      (check) => check.status === 'healthy',
    );
    const overallStatus = allHealthy ? 'ok' : 'degraded';

    if (overallStatus === 'degraded') {
      this.notificationService
        .sendHealthCheckAlert('general', overallStatus, checks)
        .catch((error) => {
          this.logger.error(
            'Failed to send health check notification',
            error,
          );
        });
    }

    return {
      status: overallStatus,
      service: 'onvi-mobile-api',
      checks,
      timestamp: new Date().toISOString(),
    };
  }
}

