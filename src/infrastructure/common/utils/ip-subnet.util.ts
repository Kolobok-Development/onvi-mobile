export function isIpInCidr(ip: string, cidr: string): boolean {
  if (!ip || ip === 'unknown') return false;
  const [range, bitsStr] = cidr.split('/');
  const bits = parseInt(bitsStr ?? '32', 10);
  const ipNum = ipToNumber(ip);
  const baseNum = ipToNumber(range.trim());
  const mask = bits === 0 ? 0 : (~((1 << (32 - bits)) - 1)) >>> 0;
  return (ipNum & mask) === (baseNum & mask);
}

function ipToNumber(ip: string): number {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4) return 0;
  return (
    (parts[0]! << 24) | (parts[1]! << 16) | (parts[2]! << 8) | (parts[3]! << 0)
  );
}
