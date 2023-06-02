import { PaymentType } from '../enum/payment-type.enum';
import { Card } from '../../account/card/model/card';

export interface ICreateOrderDto {
  card: Card;
  externalId?: string;
  orderSum: number;
  promoCodeId?: number;
  paymentType: PaymentType;
  carWashId: number;
  bayNumber: number;
}
