import { Inject, Injectable } from '@nestjs/common';
import { IOrderRepository } from '../../../domain/order/order-repository.abstract';
import { Logger } from 'nestjs-pino';
import { OrderNotFoundException } from '../../../domain/order/exceptions/order-base.exceptions';
import { OrderStatus } from '../../../domain/order/enum/order-status.enum';
import { Client } from 'src/domain/account/client/model/client';

@Injectable()
export class CarwashUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
  ) { }

  async getLatestCarwashByUser(user: Client, size: number, page: number): Promise<number[]> {
    const card = user.getCard();

    const orders = await this.orderRepository.getOrdersByCardId(card.cardId, size, page);
    
    return orders.map(order => order.carWashId);
  }
}