import { Injectable } from '@nestjs/common';
import { IJwtConfig } from '../../../domain/config/jwt-config.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvConfigService implements IJwtConfig {
  constructor(private readonly configService: ConfigService) {}

  getJwtExpirationTime(): string {
    return this.configService.get<string>('JWT_EXPIRATION_TIME');
  }

  getJwtRefreshExpirationTime(): string {
    return this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION_TIME');
  }

  getJwtRefreshSecret(): string {
    return this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET');
  }

  getJwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET');
  }
  getDsCloudBaseUrl(): string {
    return this.configService.get<string>('DS_CLOUD_URL');
  }

  getDsCloudApiKey(): string {
    return this.configService.get<string>('DS_CLOUD_API_KEY');
  }

  getDsCloudSourceId(): number {
    return this.configService.get<number>('DS_CLOUD_SOURCE');
  }

  getPaymentGatewayApiKey(): string {
    return this.configService.get<string>('PAYMENT_GATEWAY_API_KEY');
  }

  getPaymentGatewayStoreId(): number {
    return this.configService.get<number>('PAYMENT_GATEWAY_STORE_ID');
  }
  getPaymentGatewayClientApiKey(): string {
    return this.configService.get<string>('PAYMENT_GATEWAY_API_KEY_CLIENT');
  }

  getLogtailGatwayHTTPToken(): string {
    return this.configService.get<string>('LOGTAIL_HTTP_SOURCE_TOKEN');
  }

  getLogtailGatwayRunTimeToken(): string {
    return this.configService.get<string>('LOGTAIL_ERROR_SOURCE_TOKEN');
  }
  getGazpromAuthToken(): string {
    return this.configService.get<string>('GAZPROM_API_KEY');
  }
  getGazpromBaseUrl(): string {
    return this.configService.get<string>('GAZPROM_BASE_URL');
  }
  getGazpromPartnerId(): number {
    return this.configService.get<number>('GAZPROM_PARTNER_ID');
  }

  getWebhookSecret(): string {
    return this.configService.get<string>('WEBHOOK_SECRET');
  }
  getRedisHost(): string {
    return this.configService.get<string>('REDIS_ORDER_HOST');
  }
  getRedisPort(): number {
    return this.configService.get<number>('REDIS_ORDER_PORT');
  }
  getRedisUsername(): string {
    return this.configService.get<string>('REDIS_ORDER_USER');
  }
  getRedisPwsd(): string {
    return this.configService.get<string>('REDIS_DEVICE_PASSWORD');
  }
  getCacheRedisString(): string {
    return this.configService.get<string>('CACHE_REDIS_URL');
  }
}
