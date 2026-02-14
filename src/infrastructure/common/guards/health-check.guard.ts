import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { EnvConfigService } from '../../config/env-config/env-config.service';

@Injectable()
export class HealthCheckGuard implements CanActivate {
  constructor(
    private readonly configService: EnvConfigService,
    @Inject(Logger) private readonly logger: Logger,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader =
      request.headers['x-health-check-token'] ||
      request.headers['authorization'];

    if (!authHeader) {
      this.logger.warn({
        message: 'Health check endpoint accessed without token',
        ip: request.ip || request.headers['x-forwarded-for'],
        path: request.path,
      });
      throw new UnauthorizedException('Health check token is required');
    }

    const token =
      authHeader.startsWith('Bearer ') || authHeader.startsWith('bearer ')
        ? authHeader.substring(7)
        : authHeader;

    const expectedToken = this.configService.getHealthCheckToken();

    if (!expectedToken) {
      this.logger.error('Health check token not configured in environment');
      throw new UnauthorizedException('Health check not configured');
    }

    if (token !== expectedToken) {
      this.logger.warn({
        message: 'Invalid health check token provided',
        ip: request.ip || request.headers['x-forwarded-for'],
        path: request.path,
      });
      throw new UnauthorizedException('Invalid health check token');
    }

    return true;
  }
}
