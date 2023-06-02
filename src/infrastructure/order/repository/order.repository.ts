import { Injectable } from '@nestjs/common';
import { IOrderRepository } from '../../../domain/order/order-repository.abstract';
import { Order } from '../../../domain/order/model/order';

@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor() {}
  async create(order: Order): Promise<Order> {
    return Promise.resolve(undefined);
  }

  async ping(order: Order): Promise<any> {
    return Promise.resolve(undefined);
  }

  async send(order: Order): Promise<any> {
    return Promise.resolve(undefined);
  }

  async update(order: Order): Promise<void> {
    return Promise.resolve(undefined);
  }
}
