import { Card } from '../../account/card/model/card';

export interface ICreateOrderDto {
  card: Card;
  transactionId?: string;
  sum: number;
  promoCodeId?: number;
  rewardPointsUsed?: number;
  carWashId: number;
  bayNumber: number;
}
