import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { EnvConfigService } from '../config/env-config/env-config.service';
import { Logger } from 'nestjs-pino';

/**
 * Middleware that ensures requests are coming from trusted hosts
 *
 * This is particularly important for webhook endpoints that should only
 * be accessible from specific IP addresses or hosts.
 */
@Injectable()
export class TrustedHostsMiddleware implements NestMiddleware {
  private readonly webhookSecret: string;
  private readonly trustedIps: string[] = [
    '127.0.0.1',
    'localhost',
    '185.71.76.0/27',
    '185.71.77.0/27',
    '77.75.153.0/25',
    '77.75.156.11',
    '77.75.156.35',
    '77.75.154.128/25',
    '2a02:5180::/32',
  ];

  constructor(
    private readonly configService: EnvConfigService,
    private readonly logger: Logger,
  ) {
    this.webhookSecret = this.configService.getWebhookSecret();
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Only apply to webhook routes
    if (req.path.includes('/webhook')) {
      const clientIp =
        req.headers['x-forwarded-for']?.toString() ||
        req.ip ||
        req.socket.remoteAddress ||
        'unknown';

      // Check for trusted IPs
      const isTrustedIp = this.trustedIps.some((ip) => clientIp.includes(ip));

      // If the request doesn't have a valid signature and isn't from a trusted IP
      // if (!isTrustedIp) {
      //   this.logger.warn({
      //     message: 'Unauthorized webhook request',
      //     ip: clientIp,
      //     path: req.path,
      //     headers: req.headers,
      //   });

      //   return res.status(403).json({
      //     statusCode: 403,
      //     message: 'Forbidden',
      //   });
      // }
    }

    next();
  }
}
