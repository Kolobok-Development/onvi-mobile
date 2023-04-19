import { AuthenticationException } from '../../shared/excpetions/base.exceptions';
export const INVALID_REFRESH_AUTHENTIFICATION_ERROR_CODE = 51;
export class InvalidRefreshException extends AuthenticationException {
  constructor(phone: string) {
    super(
      INVALID_REFRESH_AUTHENTIFICATION_ERROR_CODE,
      `Client ${phone} invalid refresh token`,
    );
  }
}
