import { Request } from 'express';

/**
 * Get client IP from request. When trustProxy is false (default), use only
 * socket.remoteAddress. When true, use req.ip (set by Express from proxy).
 * Do not read x-forwarded-for when trust proxy is off.
 */
export function getClientIp(
  req: Request | Record<string, any>,
  trustProxy: boolean | number,
): string {
  if (trustProxy) {
    const ip = req.ip || req.socket?.remoteAddress;
    return ip ?? 'unknown';
  }
  const socket = req.socket ?? req.connection;
  return socket?.remoteAddress ?? 'unknown';
}
