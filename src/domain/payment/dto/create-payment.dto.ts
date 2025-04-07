import { Amount } from '../model/payment';
import { IPaymentMethodType } from '@a2seven/yoo-checkout/build/types';

export interface ICreatePaymentDto {
  paymentToken: string;
  amount: Amount;
  capture: boolean;
  description: string;
  paymentMethodType: IPaymentMethodType;
}
