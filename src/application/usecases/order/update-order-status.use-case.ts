import { Inject, Injectable } from '@nestjs/common';
import { IOrderRepository } from '../../../domain/order/order-repository.abstract';
import { Logger } from 'nestjs-pino';
import { OrderNotFoundException } from '../../../domain/order/exceptions/order-base.exceptions';
import { OrderStatus } from '../../../domain/order/enum/order-status.enum';

@Injectable()
export class UpdateOrderStatusUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    @Inject(Logger) private readonly logger: Logger,
  ) {}

  async execute(orderId: number, status: OrderStatus): Promise<void> {
    const order = await this.orderRepository.findOneById(orderId);

    if (!order) {
      throw new OrderNotFoundException(orderId.toString());
    }

    await this.orderRepository.updateOrderStatus(orderId, status);

    this.logger.log(
      {
        orderId: orderId,
        newStatus: status,
        action: 'update_order_status',
        timestamp: new Date(),
      },
      `Order status updated to ${status} for order ID ${orderId}`,
    );
  }
}
