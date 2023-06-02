import { AuthenticationException } from '../../../infrastructure/common/exceptions/base.exceptions';
import { INVALID_ACCESS_AUTHENTIFICATION_ERROR_CODE } from '../../../infrastructure/common/constants/constants';

export class InvalidAccessException extends AuthenticationException {
  constructor(phone: string) {
    super(
      INVALID_ACCESS_AUTHENTIFICATION_ERROR_CODE,
      `Client ${phone} invalid access token`,
    );
  }
}
