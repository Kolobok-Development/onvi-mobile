import { Order } from './model/order';
import { OrderStatus } from './enum/order-status.enum';
import { Card } from '../account/card/model/card';
import { Promotion } from '../promotion/model/promotion.model';
import { Client } from '../account/client/model/client';

export abstract class IOrderRepository {
  abstract create(order: Order): Promise<Order>;
  abstract findOneById(id: number): Promise<Order>;
  abstract findByTransactionId(transactionId: string): Promise<Order>;
  abstract update(order: Order): Promise<void>;
  abstract updateOrderStatus(id: number, status: OrderStatus): Promise<void>;
  abstract setExcecutionError(id: number, error: string): Promise<void>;
}
