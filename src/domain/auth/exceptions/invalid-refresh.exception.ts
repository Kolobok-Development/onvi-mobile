import { AuthenticationException } from '../../../infrastructure/common/exceptions/base.exceptions';
import { INVALID_REFRESH_AUTHENTIFICATION_ERROR_CODE } from '../../../infrastructure/common/constants/constants';

export class InvalidRefreshException extends AuthenticationException {
  constructor(phone: string) {
    super(
      INVALID_REFRESH_AUTHENTIFICATION_ERROR_CODE,
      `Client ${phone} invalid refresh token`,
    );
  }
}
