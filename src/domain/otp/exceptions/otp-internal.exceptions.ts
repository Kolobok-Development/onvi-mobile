import { ServerException } from '../../../infrastructure/common/exceptions/base.exceptions';
import { OTP_INTERNAL_SERVER_ERROR_CODE } from '../../../infrastructure/common/constants/constants';

export class OtpInternalExceptions extends ServerException {
  constructor(
    phone: string,
    otp: string = null,
    customMessage?: string
  ) {
    super(
      OTP_INTERNAL_SERVER_ERROR_CODE,
      customMessage || `Failed to send otp ${otp ? '= ' + otp : ''} target=${phone}`,
    );
  }
}
