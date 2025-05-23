import { Injectable } from '@nestjs/common';
import { IOrderRepository } from '../../../domain/order/order-repository.abstract';
import { Order } from '../../../domain/order/model/order';
import { OrderEntity } from '../entity/order.entity';
import { OrderStatus } from '../../../domain/order/enum/order-status.enum';
import {Between, Repository} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {DeviceType} from "../../../domain/order/enum/device-type.enum";

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

  async findOneById(id: number): Promise<Order> {
    const orderEntity = await this.orderRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!orderEntity) return null;

    return Order.fromEntity(orderEntity);
  }

  async findByTransactionId(transactionId: string): Promise<Order> {
    const orderEntity = await this.orderRepository.findOne({
      where: {
        transactionId: transactionId,
      },
    });

    if (!orderEntity) return null;

    return Order.fromEntity(orderEntity);
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
    const existingOrder = await this.orderRepository.findOne({
      where: { id: order.id },
    });

    if (!existingOrder) return null;

    await this.orderRepository.save(order);
  }

  private toOrderEntity(order: Order): OrderEntity {
    const orderEntity: OrderEntity = new OrderEntity();

    orderEntity.sum = order.sum;
    orderEntity.createdAt = order.createdAt;
    orderEntity.carWashId = order.carWashId;
    orderEntity.bayNumber = order.bayNumber;
    orderEntity.bayType = order.bayType;
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
