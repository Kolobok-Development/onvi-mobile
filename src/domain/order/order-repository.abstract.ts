import { Order } from './model/order';
import { OrderStatus } from './enum/order-status.enum';

export abstract class IOrderRepository {
  abstract create(order: Order): Promise<Order>;
  abstract update(order: Order): Promise<void>;
  abstract ping(carWashId: number, bayNumber: number): Promise<any>;
  abstract send(order: Order, bay: any): Promise<any>;
  abstract updateOrderStatus(id: number, status: OrderStatus): Promise<void>;
  abstract setExcecutionError(id: number, error: string): Promise<void>;
}
