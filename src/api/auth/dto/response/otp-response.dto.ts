import { OtpStatus } from '../../../../domain/otp/enums/otp-status.enum';

export class OtpResponseDto {
  status: OtpStatus.SENT_SUCCESS;
  target: string;

  constructor(partial: Partial<OtpResponseDto>) {
    Object.assign(this, partial);
  }
}
