import { IPaymentMethodType } from '@a2seven/yoo-checkout/build/types';

export class CreatePaymentDto {
  paymentToken: string;
  amount: string;
  currency?: string;
  capture?: boolean;
  description?: string;
  paymentMethod: IPaymentMethodType;
  returnUrl?: string;
}
