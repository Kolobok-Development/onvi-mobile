import { ServerException } from '../../shared/excpetions/base.exceptions';
const OTP_INTERNAL_SERVER_ERROR_CODE = 6;
export class OtpInternalExceptions extends ServerException {
  constructor(otp: string, phone: string) {
    super(
      OTP_INTERNAL_SERVER_ERROR_CODE,
      `Failed to send otp= ${otp} target=${phone}`,
    );
  }
}
