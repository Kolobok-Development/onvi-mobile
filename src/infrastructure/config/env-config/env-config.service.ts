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

  getTelegramBotToken(): string {
    return this.configService.get<string>('TELEGRAM_BOT_TOKEN');
  }

  getTelegramChatId(): string {
    return this.configService.get<string>('TELEGRAM_CHAT_ID');
  }

  getPachcaAccessToken(): string {
    return this.configService.get<string>('PACHCA_API_ACCESS_TOKEN');
  }

  getPachcaChatId(): string {
    return this.configService.get<string>('PACHCA_CHAT_ID');
  }

  getHealthCheckToken(): string {
    return this.configService.get<string>('HEALTH_CHECK_TOKEN');
  }

  // OTP defense: resend cooldown (Redis key TTL), default 60s
  getOtpCooldownSeconds(): number {
    return this.configService.get<number>('OTP_COOLDOWN_SECONDS') ?? 60;
  }

  // Rate limits: phone
  getRlPhonePer60S(): number {
    return this.configService.get<number>('RL_PHONE_PER_60S') ?? 1;
  }
  getRlPhonePer15M(): number {
    return this.configService.get<number>('RL_PHONE_PER_15M') ?? 3;
  }
  getRlPhonePerDay(): number {
    return this.configService.get<number>('RL_PHONE_PER_DAY') ?? 10;
  }
  getRlIpPer10M(): number {
    return this.configService.get<number>('RL_IP_PER_10M') ?? 10;
  }
  getRlGlobalPerMinute(): number {
    return this.configService.get<number>('RL_GLOBAL_PER_MINUTE') ?? 200;
  }

  getOtpLockTtlMs(): number {
    return this.configService.get<number>('OTP_LOCK_TTL_MS') ?? 5000;
  }

  getSmsAttackMode(): boolean {
    const v = this.configService.get<string>('SMS_ATTACK_MODE');
    return v === '1' || v === 'true';
  }

  getTrustProxy(): boolean | number {
    const v = this.configService.get<string>('TRUST_PROXY');
    if (v === '0' || v === 'false') return false;
    if (v === '1' || v === 'true') return true;
    const n = parseInt(v ?? '', 10);
    if (!Number.isNaN(n)) return n;
    return false;
  }
}
