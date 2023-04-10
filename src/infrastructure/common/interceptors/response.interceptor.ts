import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class ResponseFormat {
  path: string;
  duration: string;
  method: string;
  data: any;
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<ResponseFormat> {
    const now = Date.now();
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    return next.handle().pipe(
      map((data) => ({
        data,
        path: request.path,
        duration: `${Date.now() - now}ms`,
        method: request.method,
      })),
    );
  }
}
