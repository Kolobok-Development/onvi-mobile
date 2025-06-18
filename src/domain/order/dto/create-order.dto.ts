import { Card } from '../../account/card/model/card';
import { OrderStatus } from '../enum/order-status.enum';
import {DeviceType} from "../enum/device-type.enum";

export interface ICreateOrderDto {
  card: Card;
  transactionId?: string;
  status: OrderStatus;
  sum: number;
  originalSum?: number;
  promoCodeId?: number;
  rewardPointsUsed?: number;
  carWashId: number;
  bayNumber: number;
  bayType: DeviceType;
  cashback: number;
}
