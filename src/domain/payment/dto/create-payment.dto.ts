import { Amount } from '../model/payment';

export interface ICreatePaymentDto {
  paymentToken: string;
  amount: Amount;
  capture: boolean;
  description: string;
}
