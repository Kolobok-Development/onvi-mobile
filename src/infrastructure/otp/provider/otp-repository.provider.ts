import { Provider } from '@nestjs/common';
import { OtpRepository } from '../repository/otp.repository';
import { IOtpRepository } from '../../../domain/otp/adapter/otp-repository.interface';

export const OtpRepositoryProvider: Provider = {
  provide: IOtpRepository,
  useClass: OtpRepository,
};
