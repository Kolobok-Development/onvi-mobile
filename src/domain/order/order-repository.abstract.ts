import { Order } from './model/order';
import { OrderStatus } from './enum/order-status.enum';
import { Card } from '../account/card/model/card';
import { Promotion } from '../promotion/model/promotion.model';
import { Client } from '../account/client/model/client';

export abstract class IOrderRepository {
  abstract create(order: Order): Promise<Order>;
  abstract createTransaction(
    client: Client,
    card: Card,
    promotion: Promotion,
    expId: string,
  ): Promise<any>;
  abstract withdraw(
    deviceId: string,
    cardUnq: string,
    sum: string,
    pToken?: string,
  ): Promise<any>;
  abstract update(order: Order): Promise<void>;
  abstract ping(carWashId: number, bayNumber: number): Promise<any>;
  abstract send(order: Order, bay: any): Promise<any>;
  abstract updateOrderStatus(id: number, status: OrderStatus): Promise<void>;
  abstract setExcecutionError(id: number, error: string): Promise<void>;
}
