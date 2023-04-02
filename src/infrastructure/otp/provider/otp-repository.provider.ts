import { Provider } from '@nestjs/common';
import { OtpRepository } from '../repository/otp.repository';

export const OtpRepositoryProvider: Provider = {
  provide: 'OtpRepository',
  useClass: OtpRepository,
};
