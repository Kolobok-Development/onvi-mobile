import { AuthenticationException } from '../../shared/excpetions/base.exceptions';
export const INVALID_OTP_AUTHENTIFICATION_ERROR_CODE = 5;
export class InvalidOtpException extends AuthenticationException {
  constructor(phone: string) {
    super(
      INVALID_OTP_AUTHENTIFICATION_ERROR_CODE,
      `Client ${phone} invalid otp code`,
    );
  }
}
