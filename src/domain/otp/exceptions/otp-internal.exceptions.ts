import { ServerException } from '../../../infrastructure/common/exceptions/base.exceptions';
import { OTP_INTERNAL_SERVER_ERROR_CODE } from '../../../infrastructure/common/constants/constants';

export class OtpInternalExceptions extends ServerException {
  constructor(otp: string, phone: string) {
    super(
      OTP_INTERNAL_SERVER_ERROR_CODE,
      `Failed to send otp= ${otp} target=${phone}`,
    );
  }
}
