import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { BlockSubnetGuard } from './block-subnet.guard';
import { SubnetBlockConfigService } from '../../otp-defense/subnet-block-config.service';
import { EnvConfigService } from '../../config/env-config/env-config.service';

describe('BlockSubnetGuard', () => {
  let guard: BlockSubnetGuard;
  let subnetConfig: jest.Mocked<SubnetBlockConfigService>;
  let envConfig: jest.Mocked<EnvConfigService>;

  const createMockContext = (clientIp: string): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          ip: clientIp,
          socket: { remoteAddress: clientIp },
        }),
      }),
    } as ExecutionContext;
  };

  beforeEach(() => {
    subnetConfig = {
      isEnabled: jest.fn(),
      getBlockedSubnets: jest
        .fn()
        .mockReturnValue(['72.56.188.0/22', '72.56.144.0/20']),
    } as any;
    envConfig = {
      getTrustProxy: jest.fn().mockReturnValue(true),
    } as any;
    guard = new BlockSubnetGuard(subnetConfig, envConfig);
  });

  it('allows request when subnet blocking is disabled', () => {
    subnetConfig.isEnabled.mockReturnValue(false);
    const ctx = createMockContext('72.56.188.1');
    expect(guard.canActivate(ctx)).toBe(true);
    expect(subnetConfig.getBlockedSubnets).not.toHaveBeenCalled();
  });

  it('allows request when IP is not in blocked subnet', () => {
    subnetConfig.isEnabled.mockReturnValue(true);
    const ctx = createMockContext('72.56.92.68'); // production IP
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('throws ForbiddenException when IP is in blocked subnet', () => {
    subnetConfig.isEnabled.mockReturnValue(true);
    const ctx = createMockContext('72.56.188.1');
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(ctx)).toThrow('Access denied');
  });

  it('blocks other IPs in 72.56.188.0/22 range', () => {
    subnetConfig.isEnabled.mockReturnValue(true);
    for (const ip of ['72.56.189.0', '72.56.190.100', '72.56.191.255']) {
      const ctx = createMockContext(ip);
      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    }
  });

  it('blocks IPs in new 72.56.144.0/20 range', () => {
    subnetConfig.isEnabled.mockReturnValue(true);
    for (const ip of [
      '72.56.144.12',
      '72.56.145.188',
      '72.56.152.207',
      '72.56.159.203',
      '72.56.159.255',
    ]) {
      const ctx = createMockContext(ip);
      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    }
  });

  it('allows IPs outside both blocked ranges', () => {
    subnetConfig.isEnabled.mockReturnValue(true);
    for (const ip of ['72.56.92.68', '72.56.128.1', '72.56.160.1']) {
      const ctx = createMockContext(ip);
      expect(guard.canActivate(ctx)).toBe(true);
    }
  });
});
