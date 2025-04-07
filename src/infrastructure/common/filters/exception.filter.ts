import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ValidationException } from '../exceptions/validation.exception';
import { CustomHttpException } from '../exceptions/custom-http.exception';
import { SERVER_ERROR } from '../constants/constants';
import { Logger } from 'nestjs-pino';

interface IError {
  type: string;
  message: string;
  innerCode: number;
}

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(@Inject(Logger) private readonly logger: Logger) {}

  private identifyErrorSource(exception: any): string {
    // Check for common database errors
    if (
      exception.name?.includes('Database') ||
      exception.name?.includes('Sequelize') ||
      exception.name?.includes('SQL') ||
      exception.name?.includes('Postgres') ||
      exception.name?.includes('TypeORM')
    ) {
      return 'database';
    }

    // Check for payment provider errors
    if (
      exception.name?.includes('Payment') ||
      exception.message?.includes('payment') ||
      exception.message?.includes('transaction') ||
      exception.originalError?.provider === 'payment'
    ) {
      return 'payment_provider';
    }

    // Check for external service errors
    if (
      exception.code === 'ECONNREFUSED' ||
      exception.code === 'ENOTFOUND' ||
      exception.name?.includes('TimeoutError') ||
      exception.name?.includes('NetworkError')
    ) {
      return 'external_service';
    }

    // Return the name of the exception if possible
    if (exception.name && exception.name !== 'Error') {
      return exception.name
        .toLowerCase()
        .replace('error', '')
        .replace('exception', '');
    }

    return 'api_server';
  }

  /**
   * Extracts useful details from the error object
   */
  private extractErrorDetails(exception: any): any {
    const details: any = {};

    // Extract useful properties that might exist on various error types
    if (exception.code) details.code = exception.code;
    if (exception.errno) details.errno = exception.errno;
    if (exception.syscall) details.syscall = exception.syscall;
    if (exception.address) details.address = exception.address;
    if (exception.port) details.port = exception.port;
    if (exception.path) details.path = exception.path;
    if (exception.statusCode) details.statusCode = exception.statusCode;
    if (exception.statusText) details.statusText = exception.statusText;
    if (exception.response?.data)
      details.responseData = exception.response.data;
    if (exception.cause) details.cause = exception.cause;

    // If this is a payment error, try to extract payment-specific details
    if (exception.originalError?.provider === 'payment') {
      details.paymentDetails = exception.originalError.details;
    }

    return Object.keys(details).length ? details : undefined;
  }
  catch(exception: any, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request: any = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : exception instanceof ValidationException
        ? HttpStatus.BAD_REQUEST
        : HttpStatus.INTERNAL_SERVER_ERROR;
    // Identify the error source based on exception properties or name
    const errorSource = this.identifyErrorSource(exception);

    const errorResponse =
      exception instanceof CustomHttpException
        ? {
            type: exception.type,
            innerCode: exception.innerCode,
            message: exception.getResponse().toString(),
            source: errorSource,
          }
        : exception instanceof ValidationException
        ? {
            type: exception.type,
            innerCode: exception.innerCode,
            message: exception.message,
            source: errorSource,
          }
        : {
            type: errorSource || 'api_server',
            innerCode: SERVER_ERROR,
            message: (exception as Error).message,
            source: errorSource,
            details: this.extractErrorDetails(exception),
          };
    const message = errorResponse.message;

    const error = {
      code: errorResponse.innerCode,
      type: errorResponse.type,
      message,
      source: errorResponse.source,
    };

    const responseData = {
      ...error,
      ...{
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    };

    // Add details to the response if they exist
    if (errorResponse.details) {
      responseData['details'] = errorResponse.details;
    }

    // Generate a unique request ID if not present
    const requestId =
      request.id ||
      `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // Attach requestId to the response
    responseData['requestId'] = requestId;

    // Add the request ID to the error object for correlation
    const errorObj = {
      err: {
        ...exception,
        type: errorResponse.type,
        source: errorResponse.source,
        details: errorResponse.details,
        requestId,
      },
      req: {
        id: requestId,
        url: request.url,
        method: request.method,
        body: request.body,
        params: request.params,
        query: request.query,
        headers: request.headers,
      },
    };

    // Log the error to Logtail with rich context
    this.logger.error(
      errorObj,
      `Exception caught: ${errorResponse.source} error during ${request.method} ${request.url}`,
    );

    response.status(status).json(responseData);
  }
}
