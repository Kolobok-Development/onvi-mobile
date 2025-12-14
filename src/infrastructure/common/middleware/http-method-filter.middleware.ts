import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to reject unsupported HTTP methods early
 * This prevents PROPFIND and other WebDAV methods from consuming CPU
 * by going through the entire NestJS routing pipeline
 */
@Injectable()
export class HttpMethodFilterMiddleware implements NestMiddleware {
  // Supported HTTP methods for this API
  private readonly supportedMethods = [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS', // Keep OPTIONS for CORS preflight
  ];

  use(req: Request, res: Response, next: NextFunction) {
    const method = req.method?.toUpperCase();

    // Reject unsupported methods early (before routing)
    if (!this.supportedMethods.includes(method)) {
      // Return 405 Method Not Allowed immediately
      res.status(405).json({
        statusCode: 405,
        message: `Method ${method} is not allowed`,
        error: 'Method Not Allowed',
        timestamp: new Date().toISOString(),
      });
      return; // Stop processing - don't call next()
    }

    next();
  }
}
