import { Injectable, Inject } from '@nestjs/common';
import { AuthUsecase } from '../auth/auth.usecase';
import { INotificationService } from '../../../domain/health/adapter/notification-service.interface';
import { Logger } from 'nestjs-pino';

@Injectable()
export class OtpHealthCheckUseCase {
  private readonly testPhone = '+79191854846';

  constructor(
    private readonly authUsecase: AuthUsecase,
    private readonly notificationService: INotificationService,
    @Inject(Logger) private readonly logger: Logger,
  ) {}

  async execute(): Promise<{
    status: string;
    service: string;
    check: {
      type: string;
      status: string;
      latency: number;
      testPhone: string;
      otpCode?: string;
      error?: string;
    };
    timestamp: string;
  }> {
    const startTime = Date.now();

    try {
      const otp = await this.authUsecase.sendOtp(
        this.testPhone,
        'health-check',
      );
      const latency = Date.now() - startTime;

      return {
        status: 'ok',
        service: 'onvi-mobile-api',
        check: {
          type: 'otp_send',
          status: 'healthy',
          latency,
          testPhone: this.testPhone,
          otpCode: otp.otp,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorDetails = {
        type: 'otp_send',
        status: 'unhealthy',
        latency: Date.now() - startTime,
        testPhone: this.testPhone,
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      this.notificationService
        .sendHealthCheckAlert('otp', 'degraded', errorDetails)
        .catch((notificationError) => {
          this.logger.error(
            'Failed to send OTP health check notification',
            notificationError,
          );
        });

      return {
        status: 'degraded',
        service: 'onvi-mobile-api',
        check: errorDetails,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

