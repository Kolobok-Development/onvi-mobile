import { Card } from '../../account/card/model/card';
import { OrderStatus } from '../enum/order-status.enum';

export interface ICreateOrderDto {
  card: Card;
  transactionId?: string;
  status: OrderStatus;
  sum: number;
  promoCodeId?: number;
  rewardPointsUsed?: number;
  carWashId: number;
  bayNumber: number;
  cashback: number;
}
