import { Injectable } from '@nestjs/common';
import { IOrderRepository } from '../../../domain/order/order-repository.abstract';
import { Order } from '../../../domain/order/model/order';
import { OrderEntity } from '../entity/order.entity';
import { OrderStatus } from '../../../domain/order/enum/order-status.enum';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {}
  async create(order: Order): Promise<Order> {
    const orderEntity = this.toOrderEntity(order);

    const newOrder = await this.orderRepository.save(orderEntity);
    return Order.fromEntity(newOrder);
  }

  async updateOrderStatus(id: number, status: OrderStatus): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { id: id },
    });

    if (!order) return null;

    order.orderStatus = status;

    await this.orderRepository.save(order);
  }

  async setExcecutionError(id: number, error: string): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { id: id },
    });

    if (!order) return null;

    order.excecutionError = error;

    await this.orderRepository.save(order);
  }

  async update(order: Order): Promise<void> {
    return Promise.resolve(undefined);
  }


  private toOrderEntity(order: Order): OrderEntity {
    const orderEntity: OrderEntity = new OrderEntity();

    orderEntity.sum = order.sum;
    orderEntity.createdAt = order.createdAt;
    orderEntity.carWashId = order.carWashId;
    orderEntity.bayNumber = order.bayNumber;
    orderEntity.orderStatus = order.orderStatus;
    orderEntity.rewardPointsUsed = order.rewardPointsUsed;
    orderEntity.promoCodeId = order.promoCodeId;
    orderEntity.discountAmount = order.discountAmount;
    orderEntity.transactionId = order.transactionId;
    orderEntity.excecutionError = order.excecutionError;
    orderEntity.cardId = order.card.cardId;

    return orderEntity;
  }
}
