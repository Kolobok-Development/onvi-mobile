import { Injectable, Inject, Optional } from '@nestjs/common';
import Redis from 'ioredis';
import { CACHE_REDIS_CLIENT } from '../redis/cache-redis.module';
import { EnvConfigService } from '../config/env-config/env-config.service';

const LOCK_PREFIX = 'lock:otp:';
const COOLDOWN_PREFIX = 'otp:cooldown:';

@Injectable()
export class OtpDefenseService {
  constructor(
    @Optional()
    @Inject(CACHE_REDIS_CLIENT)
    private readonly redis: Redis | null,
    private readonly env: EnvConfigService,
  ) {}

  /**
   * Acquire per-phone lock. When Redis is unavailable, returns true so request is not blocked.
   */
  async acquireLock(phone: string): Promise<boolean> {
    if (!this.redis) return true;
    const key = LOCK_PREFIX + this.normalize(phone);
    const ttl = this.env.getOtpLockTtlMs();
    try {
      const result = await this.redis.set(key, '1', 'PX', ttl, 'NX');
      return result === 'OK';
    } catch {
      return true;
    }
  }

  async releaseLock(phone: string): Promise<void> {
    if (!this.redis) return;
    const key = LOCK_PREFIX + this.normalize(phone);
    try {
      await this.redis.del(key);
    } catch {
      // ignore
    }
  }

  /**
   * True if phone is in cooldown (resend too soon). When Redis is unavailable, returns false so usecase can use DB fallback.
   */
  async inCooldown(phone: string): Promise<boolean> {
    if (!this.redis) return false;
    const key = COOLDOWN_PREFIX + this.normalize(phone);
    try {
      const exists = await this.redis.exists(key);
      return exists === 1;
    } catch {
      return false;
    }
  }

  /**
   * Set cooldown after successful send. No-op when Redis is unavailable.
   */
  async setCooldown(phone: string): Promise<void> {
    if (!this.redis) return;
    const key = COOLDOWN_PREFIX + this.normalize(phone);
    const ttl = this.env.getOtpCooldownSeconds();
    try {
      await this.redis.set(key, '1', 'EX', ttl);
    } catch {
      // ignore
    }
  }

  private normalize(phone: string): string {
    return (phone ?? '').replace(/\s/g, '').slice(-32) || 'unknown';
  }
}
