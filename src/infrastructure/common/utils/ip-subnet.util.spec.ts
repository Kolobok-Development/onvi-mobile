import { isIpInCidr } from './ip-subnet.util';

describe('ip-subnet.util', () => {
  describe('isIpInCidr', () => {
    const cidr = '72.56.188.0/22';

    it('returns true for IPs inside 72.56.188.0/22', () => {
      expect(isIpInCidr('72.56.188.0', cidr)).toBe(true);
      expect(isIpInCidr('72.56.188.1', cidr)).toBe(true);
      expect(isIpInCidr('72.56.189.0', cidr)).toBe(true);
      expect(isIpInCidr('72.56.190.255', cidr)).toBe(true);
      expect(isIpInCidr('72.56.191.255', cidr)).toBe(true);
    });

    it('returns false for IPs outside 72.56.188.0/22', () => {
      expect(isIpInCidr('72.56.187.255', cidr)).toBe(false);
      expect(isIpInCidr('72.56.192.0', cidr)).toBe(false);
      expect(isIpInCidr('72.56.92.68', cidr)).toBe(false); // production IP
      expect(isIpInCidr('10.0.0.1', cidr)).toBe(false);
      expect(isIpInCidr('8.8.8.8', cidr)).toBe(false);
    });

    it('returns false for empty or unknown IP', () => {
      expect(isIpInCidr('', cidr)).toBe(false);
      expect(isIpInCidr('unknown', cidr)).toBe(false);
      expect(isIpInCidr(null as any, cidr)).toBe(false);
      expect(isIpInCidr(undefined as any, cidr)).toBe(false);
    });

    it('works with other CIDRs', () => {
      expect(isIpInCidr('10.0.0.1', '10.0.0.0/8')).toBe(true);
      expect(isIpInCidr('10.0.0.1', '10.0.0.0/24')).toBe(true);
      expect(isIpInCidr('10.0.1.0', '10.0.0.0/24')).toBe(false);
      expect(isIpInCidr('192.168.1.1', '192.168.1.0/24')).toBe(true);
    });

    it('matches IPs inside 72.56.144.0/20 (new attack range)', () => {
      const newCidr = '72.56.144.0/20';
      expect(isIpInCidr('72.56.144.0', newCidr)).toBe(true);
      expect(isIpInCidr('72.56.145.188', newCidr)).toBe(true);
      expect(isIpInCidr('72.56.152.207', newCidr)).toBe(true);
      expect(isIpInCidr('72.56.159.255', newCidr)).toBe(true);
    });

    it('rejects IPs outside 72.56.144.0/20', () => {
      const newCidr = '72.56.144.0/20';
      expect(isIpInCidr('72.56.143.255', newCidr)).toBe(false);
      expect(isIpInCidr('72.56.160.0', newCidr)).toBe(false);
      expect(isIpInCidr('72.56.92.68', newCidr)).toBe(false);
    });
  });
});
