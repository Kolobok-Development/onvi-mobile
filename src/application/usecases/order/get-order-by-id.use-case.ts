import { Inject, Injectable } from '@nestjs/common';
import { IOrderRepository } from '../../../domain/order/order-repository.abstract';
import { Logger } from 'nestjs-pino';
import { OrderNotFoundException } from '../../../domain/order/exceptions/order-base.exceptions';
import { Client } from '../../../domain/account/client/model/client';

@Injectable()
export class GetOrderByIdUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    @Inject(Logger) private readonly logger: Logger,
  ) {}

  async execute(orderId: number, client: Client): Promise<any> {
    const order = await this.orderRepository.findOneById(orderId);

    if (!order) {
      throw new OrderNotFoundException(orderId.toString());
    }

    this.logger.log(
      {
        orderId: order.id,
        action: 'get_order_details',
        timestamp: new Date(),
      },
      `Order details retrieved for order ID ${order.id}`,
    );

    const card = client.getCard();
    let estimateCardBalance = card.balance;

    if (order.rewardPointsUsed > 0) {
      estimateCardBalance -= order.rewardPointsUsed;
    }

    return {
      id: order.id,
      status: order.orderStatus,
      carWashId: order.carWashId,
      bayNumber: order.bayNumber,
      sum: order.sum,
      cashback: order.cashback,
      card: {
        id: card.cardId,
        number: card.devNomer,
        balance: estimateCardBalance,
      },
      promoCodeId: order.promoCodeId,
      discountAmount: order.discountAmount,
      rewardPointsUsed: order.rewardPointsUsed,
      createdAt: order.createdAt,
      transactionId: order.transactionId,
      error: order.excecutionError,
    };
  }
}
