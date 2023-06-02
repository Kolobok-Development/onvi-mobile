import { Provider } from '@nestjs/common';
import { IOrderRepository } from '../../../domain/order/order-repository.abstract';
import { OrderRepository } from '../repository/order.repository';

export const OrderRepositoryProvider: Provider = {
  provide: IOrderRepository,
  useClass: OrderRepository,
};
