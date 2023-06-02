import { AuthenticationException } from '../../../infrastructure/common/exceptions/base.exceptions';
import { INVALID_OTP_AUTHENTIFICATION_ERROR_CODE } from '../../../infrastructure/common/constants/constants';

export class InvalidOtpException extends AuthenticationException {
  constructor(phone: string) {
    super(
      INVALID_OTP_AUTHENTIFICATION_ERROR_CODE,
      `Client ${phone} invalid otp code`,
    );
  }
}
