import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Logger } from 'nestjs-pino';

export class ResponseFormat {
  path: string;
  duration: string;
  method: string;
  data: any;
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  private static appInstance: any = null;

  static setAppInstance(app: any): void {
    ResponseInterceptor.appInstance = app;
  }

  private getLogger(): Logger | null {
    try {
      if (ResponseInterceptor.appInstance) {
        return ResponseInterceptor.appInstance.get(Logger);
      }
    } catch (e) {
      // If logger is not available, return null (logging will be skipped)
    }
    return null;
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<ResponseFormat> {
    const now = Date.now();
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();

    // Store start time for duration calculation
    (request as any).startTime = now;

    // Extract user context if available
    const user = (request as any).user;
    const userId = user?.clientId || user?.id || null;
    const userPhone = user?.correctPhone || user?.phone || null;

    // Extract IP address
    const ipAddress =
      request.headers['x-forwarded-for']?.toString() ||
      request.ip ||
      request.connection?.remoteAddress ||
      'unknown';

    // Get request ID
    const requestId =
      request.id ||
      `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    request.id = requestId;

    return next.handle().pipe(
      map((data) => ({
        data,
        path: request.path,
        duration: `${Date.now() - now}ms`,
        method: request.method,
      })),
      tap((responseData) => {
        // Log successful requests with structured data (only for non-2xx or slow requests)
        const duration = Date.now() - now;
        const statusCode = response.statusCode;

        // Log slow requests (>1s) or errors for debugging
        if (duration > 1000 || statusCode >= 400) {
          const logger = this.getLogger();
          if (logger) {
            const logData = {
              request: {
                id: requestId,
                method: request.method,
                url: request.url,
                path: request.path,
                query: request.query,
                params: request.params,
                ip: ipAddress,
                userAgent: request.headers['user-agent'] || null,
                duration: `${duration}ms`,
              },
              response: {
                statusCode: statusCode,
                duration: `${duration}ms`,
              },
              user: userId
                ? {
                    id: userId,
                    phone: userPhone,
                  }
                : null,
              context: {
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'production',
                service: 'onvi-mobile-api',
              },
            };

            if (statusCode >= 400) {
              logger.warn(
                logData,
                `[${statusCode}] ${request.method} ${request.url} - ${duration}ms`,
              );
            } else if (duration > 1000) {
              logger.warn(
                logData,
                `[SLOW] ${request.method} ${request.url} - ${duration}ms`,
              );
            }
          }
        }
      }),
    );
  }
}
