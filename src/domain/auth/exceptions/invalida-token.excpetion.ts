import { AuthenticationException } from '../../shared/excpetions/base.exceptions';
export const INVALID_ACCESS_AUTHENTIFICATION_ERROR_CODE = 52;
export class InvalidAccessException extends AuthenticationException {
  constructor(phone: string) {
    super(
      INVALID_ACCESS_AUTHENTIFICATION_ERROR_CODE,
      `Client ${phone} invalid access token`,
    );
  }
}
