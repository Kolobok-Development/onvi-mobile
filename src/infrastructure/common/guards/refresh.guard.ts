import { HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotAllowedException } from '../exceptions/base.exceptions';
import { USER_UNAUTHORIZED_ERROR_CODE } from '../constants/constants';
import { CustomHttpException } from '../exceptions/custom-http.exception';

@Injectable()
export class RefreshGuard extends AuthGuard('jwt-refresh-token') {
  constructor() {
    super();
  }

  handleRequest(err: any, user: any, info: any, context: any, status: any) {
    if (err || !user) {
      const error = new NotAllowedException(
        USER_UNAUTHORIZED_ERROR_CODE,
        'Unauthorized',
      );
      throw new CustomHttpException({
        type: error.type,
        innerCode: error.innerCode,
        message: error.message,
        code: HttpStatus.UNAUTHORIZED,
      });
    }
    return user;
  }
}
