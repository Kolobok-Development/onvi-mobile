import { Test, TestingModule } from '@nestjs/testing';
import { RateLimiterService } from './rate-limiter.service';
import { EnvConfigService } from '../config/env-config/env-config.service';
import { CACHE_REDIS_CLIENT } from '../redis/cache-redis.module';

describe('RateLimiterService', () => {
  let service: RateLimiterService;
  let env: jest.Mocked<EnvConfigService>;

  const mockEnv = {
    getRlPhonePer60S: jest.fn().mockReturnValue(1),
    getRlPhonePer15M: jest.fn().mockReturnValue(3),
    getRlPhonePerDay: jest.fn().mockReturnValue(10),
    getRlIpPer10M: jest.fn().mockReturnValue(10),
    getRlGlobalPerMinute: jest.fn().mockReturnValue(200),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimiterService,
        { provide: EnvConfigService, useValue: mockEnv },
        { provide: CACHE_REDIS_CLIENT, useValue: null },
      ],
    }).compile();

    service = module.get<RateLimiterService>(RateLimiterService);
    env = module.get(EnvConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('in-memory fallback (no Redis)', () => {
    it('checkPhone allows first request', async () => {
      const result = await service.checkPhone('+79123456789');
      expect(result.allowed).toBe(true);
    });

    it('checkPhone denies when over limit (1 per 60s)', async () => {
      mockEnv.getRlPhonePer60S.mockReturnValue(1);
      await service.checkPhone('+79111111111');
      const result = await service.checkPhone('+79111111111');
      expect(result.allowed).toBe(false);
    });

    it('checkIp allows under limit', async () => {
      const result = await service.checkIp('192.168.1.1');
      expect(result.allowed).toBe(true);
    });

    it('checkGlobal allows under limit', async () => {
      const result = await service.checkGlobal();
      expect(result.allowed).toBe(true);
    });
  });
});
