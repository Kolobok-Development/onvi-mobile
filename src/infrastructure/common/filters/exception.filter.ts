import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ValidationException } from '../exceptions/validation.exception';

interface IError {
  type: string;
  message: string;
  innerCode: number;
}

/*
    TODO
    1) Add Error logging
 */

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor() {}
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
    const errorResponse =
      exception instanceof HttpException
        ? (exception.getResponse() as IError)
        : exception instanceof ValidationException
        ? {
            type: exception.type,
            innerCode: exception.innerCode,
            message: exception.message,
          }
        : {
            type: 'api.internal',
            innerCode: null,
            message: (exception as Error).message,
          };
    const message = errorResponse.message;

    const error = {
      code: errorResponse.innerCode,
      type: errorResponse.type,
      message,
    };

    const responseData = {
      ...error,
      ...{
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    };

    //console.log(exception.getResponse().message);
    response.status(status).json(responseData);
  }
}
