import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { EnvConfigModule } from '../config/env-config/env-config.module';
import { EnvConfigService } from '../config/env-config/env-config.service';
import { ThrottlerBehindProxyGuard } from '../common/guards/throttler-behind-proxy.guard';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [EnvConfigModule],
      inject: [EnvConfigService],
      useFactory: (env: EnvConfigService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: 60000, // 1 minute
            limit: 100, // 100 requests per minute by default
          },
          {
            name: 'auth',
            ttl: 60000, // 1 minute
            limit: 10, // 5 auth requests per minute
          },
          {
            name: 'otp',
            ttl: 300000, // 5 minutes
            limit: 5, // 3 OTP requests per 5 minutes
          },
          {
            name: 'sensitive',
            ttl: 60000, // 1 minute
            limit: 10, // 10 sensitive operations per minute
          },
          {
            name: 'webhook',
            ttl: 60000, // 1 minute
            limit: 30, // 30 webhook requests per minute
          },
        ],
        storage: new ThrottlerStorageRedisService(env.getCacheRedisString()),
      }),
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
  ],
  exports: [],
})
export class ThrottlerConfigModule {}
