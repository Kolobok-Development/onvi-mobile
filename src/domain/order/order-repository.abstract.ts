import { Order } from './model/order';

export abstract class IOrderRepository {
  abstract create(order: Order): Promise<Order>;
  abstract update(order: Order): Promise<void>;
  abstract ping(order: Order): Promise<any>;
  abstract send(order: Order): Promise<any>;
}
