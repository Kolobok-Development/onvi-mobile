import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';
import { EnvConfigModule } from '../config/env-config/env-config.module';
import { EnvConfigService } from '../config/env-config/env-config.service';

export const CACHE_REDIS_CLIENT = 'CACHE_REDIS_CLIENT';

@Global()
@Module({
  imports: [EnvConfigModule],
  providers: [
    {
      provide: CACHE_REDIS_CLIENT,
      useFactory: (env: EnvConfigService): Redis | null => {
        const url = env.getCacheRedisString();
        if (!url || typeof url !== 'string' || url.trim() === '') {
          return null;
        }
        return new Redis(url, {
          maxRetriesPerRequest: 2,
          retryStrategy: (times) => (times <= 2 ? 500 : null),
          lazyConnect: true,
        });
      },
      inject: [EnvConfigService],
    },
  ],
  exports: [CACHE_REDIS_CLIENT],
})
export class CacheRedisModule {}
