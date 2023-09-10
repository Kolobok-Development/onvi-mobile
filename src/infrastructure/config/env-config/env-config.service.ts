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
}
