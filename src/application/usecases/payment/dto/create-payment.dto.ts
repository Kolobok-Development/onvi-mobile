import { IPaymentMethodType } from '@a2seven/yoo-checkout/build/types';

export class CreatePaymentDto {
  paymentToken: string;
  amount: string;
  description?: string;
}
