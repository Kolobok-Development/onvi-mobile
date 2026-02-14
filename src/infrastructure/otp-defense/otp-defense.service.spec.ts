import { Test, TestingModule } from '@nestjs/testing';
import { OtpDefenseService } from './otp-defense.service';
import { EnvConfigService } from '../config/env-config/env-config.service';
import { CACHE_REDIS_CLIENT } from '../redis/cache-redis.module';
import Redis from 'ioredis';

describe('OtpDefenseService', () => {
  let service: OtpDefenseService;

  const mockEnv = {
    getOtpLockTtlMs: jest.fn().mockReturnValue(5000),
    getOtpCooldownSeconds: jest.fn().mockReturnValue(60),
  };

  describe('without Redis', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          OtpDefenseService,
          { provide: EnvConfigService, useValue: mockEnv },
          { provide: CACHE_REDIS_CLIENT, useValue: null },
        ],
      }).compile();

      service = module.get<OtpDefenseService>(OtpDefenseService);
    });

    it('acquireLock returns true (no block)', async () => {
      const result = await service.acquireLock('+79123456789');
      expect(result).toBe(true);
    });

    it('inCooldown returns false', async () => {
      const result = await service.inCooldown('+79123456789');
      expect(result).toBe(false);
    });

    it('releaseLock and setCooldown do not throw', async () => {
      await expect(service.releaseLock('+79123456789')).resolves.not.toThrow();
      await expect(service.setCooldown('+79123456789')).resolves.not.toThrow();
    });
  });

  describe('with Redis mock', () => {
    let redis: jest.Mocked<Redis>;

    beforeEach(async () => {
      redis = {
        set: jest.fn(),
        del: jest.fn(),
        exists: jest.fn(),
      } as any;

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          OtpDefenseService,
          { provide: EnvConfigService, useValue: mockEnv },
          { provide: CACHE_REDIS_CLIENT, useValue: redis },
        ],
      }).compile();

      service = module.get<OtpDefenseService>(OtpDefenseService);
    });

    it('acquireLock returns true when SET NX succeeds', async () => {
      redis.set.mockResolvedValue('OK' as any);

      const result = await service.acquireLock('+79123456789');

      expect(result).toBe(true);
      expect(redis.set).toHaveBeenCalledWith(
        'lock:otp:+79123456789',
        '1',
        'PX',
        5000,
        'NX',
      );
    });

    it('acquireLock returns false when SET NX returns null (already locked)', async () => {
      redis.set.mockResolvedValue(null as any);

      const result = await service.acquireLock('+79123456789');

      expect(result).toBe(false);
    });

    it('inCooldown returns true when key exists', async () => {
      redis.exists.mockResolvedValue(1 as any);

      const result = await service.inCooldown('+79123456789');

      expect(result).toBe(true);
      expect(redis.exists).toHaveBeenCalledWith('otp:cooldown:+79123456789');
    });

    it('setCooldown sets key with EX', async () => {
      redis.set.mockResolvedValue('OK' as any);

      await service.setCooldown('+79123456789');

      expect(redis.set).toHaveBeenCalledWith(
        'otp:cooldown:+79123456789',
        '1',
        'EX',
        60,
      );
    });
  });
});
