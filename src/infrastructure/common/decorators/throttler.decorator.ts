import { SetMetadata } from '@nestjs/common';

export const THROTTLER_LIMIT = 'THROTTLER_LIMIT';
export const THROTTLER_TTL = 'THROTTLER_TTL';
export const THROTTLER_SKIP = 'THROTTLER_SKIP';

/**
 * Decorator that sets throttling options for a controller or a route
 */
export const Throttle = (limit: number, ttl: number) =>
  SetMetadata(THROTTLER_LIMIT, { limit, ttl });

/**
 * Decorator that applies a specific throttle type to a route
 */
export const ThrottleType = (type: string) =>
  SetMetadata('throttleType', type);

/**
 * Decorator that skips throttling for a controller or a route
 */
export const SkipThrottle = (skip = true) =>
  SetMetadata(THROTTLER_SKIP, skip);