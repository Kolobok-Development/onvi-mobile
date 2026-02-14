import { Injectable, Inject, Optional } from '@nestjs/common';
import Redis from 'ioredis';
import { CACHE_REDIS_CLIENT } from '../redis/cache-redis.module';
import { EnvConfigService } from '../config/env-config/env-config.service';

const LUA_INCR_LIMIT = `
local v = redis.call('INCR', KEYS[1])
if v == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
if v <= tonumber(ARGV[2]) then
  return 1
end
return 0
`;

export interface RateLimitResult {
  allowed: boolean;
}

interface MemoryWindow {
  count: number;
  resetAt: number;
}

@Injectable()
export class RateLimiterService {
  private readonly memory = new Map<string, MemoryWindow>();

  constructor(
    @Optional()
    @Inject(CACHE_REDIS_CLIENT)
    private readonly redis: Redis | null,
    private readonly env: EnvConfigService,
  ) {}

  async checkPhone(phone: string): Promise<RateLimitResult> {
    const normalized = this.normalizeKey(phone);
    const checks = [
      {
        key: `rl:phone:60:${normalized}`,
        ttl: 60,
        limit: this.env.getRlPhonePer60S(),
      },
      {
        key: `rl:phone:900:${normalized}`,
        ttl: 900,
        limit: this.env.getRlPhonePer15M(),
      },
      {
        key: `rl:phone:86400:${normalized}`,
        ttl: 86400,
        limit: this.env.getRlPhonePerDay(),
      },
    ];
    for (const { key, ttl, limit } of checks) {
      const result = await this.check(key, ttl, limit);
      if (!result.allowed) return result;
    }
    return { allowed: true };
  }

  async checkIp(ip: string): Promise<RateLimitResult> {
    const key = `rl:ip:600:${this.normalizeKey(ip)}`;
    return this.check(key, 600, this.env.getRlIpPer10M());
  }

  async checkGlobal(): Promise<RateLimitResult> {
    return this.check('rl:global:60:otp', 60, this.env.getRlGlobalPerMinute());
  }

  private async check(
    key: string,
    ttlSeconds: number,
    limit: number,
  ): Promise<RateLimitResult> {
    if (this.redis) {
      try {
        const result = await this.redis.eval(
          LUA_INCR_LIMIT,
          1,
          key,
          String(ttlSeconds),
          String(limit),
        );
        return { allowed: result === 1 };
      } catch {
        return this.checkMemory(key, ttlSeconds, limit);
      }
    }
    return this.checkMemory(key, ttlSeconds, limit);
  }

  private checkMemory(
    key: string,
    ttlSeconds: number,
    limit: number,
  ): RateLimitResult {
    const now = Date.now();
    const windowMs = ttlSeconds * 1000;
    let w = this.memory.get(key);
    if (!w || now >= w.resetAt) {
      w = { count: 0, resetAt: now + windowMs };
      this.memory.set(key, w);
    }
    w.count += 1;
    return { allowed: w.count <= limit };
  }

  private normalizeKey(s: string): string {
    return (s ?? '').replace(/\s/g, '').slice(-32) || 'unknown';
  }
}
