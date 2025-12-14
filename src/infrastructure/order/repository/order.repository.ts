import { Injectable } from '@nestjs/common';
import { IOrderRepository } from '../../../domain/order/order-repository.abstract';
import { Order } from '../../../domain/order/model/order';
import { OrderEntity } from '../entity/order.entity';
import { OrderStatus } from '../../../domain/order/enum/order-status.enum';
import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceType } from '../../../domain/order/enum/device-type.enum';

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

  async getOrdersByCardId(
    cardId: number,
    size: number,
    page: number,
  ): Promise<Order[]> {
    // 1. Получаем список {carWashId, maxCreatedAt}
    const latestOrders = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.carWashId', 'carWashId')
      .addSelect('MAX(order.createdAt)', 'maxCreatedAt')
      .where({
        cardId,
        orderStatus: OrderStatus.COMPLETED,
      })
      .groupBy('order.carWashId')
      .getRawMany();

    // Если нет последних заказов - сразу возвращаем пустой массив
    if (latestOrders.length === 0) {
      return [];
    }

    // 2. Формируем список условий для поиска точных заказов
    const latestOrdersMap = new Map<number, Date>();
    latestOrders.forEach((row: any) => {
      latestOrdersMap.set(row.carWashId, new Date(row.maxCreatedAt));
    });

    // 3. Ищем заказы, которые совпадают по carWashId и createdAt
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .where({
        cardId,
        orderStatus: OrderStatus.COMPLETED,
      })
      .andWhere((qb) => {
        const ors = [];
        for (const [carWashId, maxCreatedAt] of latestOrdersMap.entries()) {
          ors.push(
            `(order.carWashId = :carWashId${carWashId} AND order.createdAt = :maxCreatedAt${carWashId})`,
          );
          qb.setParameter(`carWashId${carWashId}`, carWashId);
          qb.setParameter(`maxCreatedAt${carWashId}`, maxCreatedAt);
        }
        return ors.join(' OR ');
      })
      .orderBy('order.createdAt', 'DESC')
      .skip((page - 1) * size)
      .take(size)
      .getMany();

    return result.map(Order.fromEntity);
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
    orderEntity.cashback = order.cashback;

    return orderEntity;
  }
}
