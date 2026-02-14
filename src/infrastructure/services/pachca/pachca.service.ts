import { Injectable, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Logger } from 'nestjs-pino';
import { EnvConfigService } from '../../config/env-config/env-config.service';
import { INotificationService } from '../../../domain/health/adapter/notification-service.interface';

@Injectable()
export class PachcaService implements INotificationService {
  private readonly accessToken: string;
  private readonly chatId: string;
  private readonly apiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly envConfig: EnvConfigService,
    @Inject(Logger) private readonly logger: Logger,
  ) {
    this.accessToken = this.envConfig.getPachcaAccessToken();
    this.chatId = this.envConfig.getPachcaChatId();
    this.apiUrl = 'https://api.pachca.com/api/shared/v1';
  }

  async sendMessage(message: string): Promise<boolean> {
    if (!this.accessToken || !this.chatId) {
      this.logger.warn(
        'PACHCA access token or chat ID not configured. Skipping notification.',
      );
      return false;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.apiUrl}/messages`,
          {
            message: {
              entity_type: 'discussion',
              entity_id: parseInt(this.chatId, 10),
              content: message,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      if (response.status === 200 || response.status === 201) {
        this.logger.log('PACHCA notification sent successfully');
        return true;
      } else {
        this.logger.error(
          `Failed to send PACHCA notification: ${
            response.statusText || 'Unknown error'
          }`,
        );
        return false;
      }
    } catch (error) {
      const errorResponse = error.response?.data || null;
      const errorStatus = error.response?.status || null;
      const requestUrl = `${this.apiUrl}/messages`;

      this.logger.error(
        {
          error: {
            message: error.message,
            code: error.code || null,
            status: errorStatus,
            response: errorResponse,
            requestUrl: requestUrl,
            entityId: this.chatId,
          },
        },
        `Error sending PACHCA notification: ${error.message}`,
      );

      if (errorStatus === 404) {
        this.logger.error(
          `PACHCA API endpoint not found. Tried: ${requestUrl}. Please verify the API endpoint and entity ID.`,
        );
      } else if (errorStatus === 401) {
        this.logger.error(
          'PACHCA API authentication failed. Please verify the access token.',
        );
      } else if (errorStatus === 403) {
        this.logger.error(
          'PACHCA API access forbidden. Please verify the access token has permission to send messages.',
        );
      } else if (errorStatus === 422) {
        this.logger.error(
          `PACHCA API validation error. Response: ${JSON.stringify(
            errorResponse,
          )}`,
        );
      }

      return false;
    }
  }

  async sendHealthCheckAlert(
    checkType: string,
    status: string,
    details: any,
  ): Promise<boolean> {
    const timestamp = new Date().toISOString();
    const emoji = status === 'ok' ? '✅' : '❌';

    const message = `
${emoji} *Health Check Alert*

*Type:* ${checkType}
*Status:* ${status}
*Time:* ${timestamp}

*Details:*
\`\`\`
${JSON.stringify(details, null, 2)}
\`\`\`
    `.trim();

    return this.sendMessage(message);
  }
}
