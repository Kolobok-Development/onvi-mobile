import { Provider } from '@nestjs/common';
import { IPaymentRepository } from '../../../domain/payment/adapter/payment.interface';
import { PaymentRepository } from '../repository/payment.repository';

export const PaymentRepositoryProvider: Provider = {
  provide: IPaymentRepository,
  useClass: PaymentRepository,
};
