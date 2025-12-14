import { Inject, Injectable } from '@nestjs/common';
import { IOrderRepository } from '../../../domain/order/order-repository.abstract';
import { Logger } from 'nestjs-pino';
import { OrderNotFoundException } from '../../../domain/order/exceptions/order-base.exceptions';

@Injectable()
export class GetOrderByTransactionIdUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    @Inject(Logger) private readonly logger: Logger,
  ) {}

  async execute(transactionId: string): Promise<any> {
    const order = await this.orderRepository.findByTransactionId(transactionId);

    if (!order) {
      throw new OrderNotFoundException(
        `Order with transaction ID ${transactionId} not found`,
      );
    }

    this.logger.log(
      {
        orderId: order.id,
        transactionId: order.transactionId,
        action: 'get_order_by_transaction_id',
        timestamp: new Date(),
      },
      `Order details retrieved for transaction ID ${transactionId}`,
    );

    let estimateCardBalance = order.card?.balance || 0;

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
      card: order.card
        ? {
            id: order.card.cardId,
            number: order.card.devNomer,
            balance: estimateCardBalance,
          }
        : null,
      promoCodeId: order.promoCodeId,
      discountAmount: order.discountAmount,
      rewardPointsUsed: order.rewardPointsUsed,
      createdAt: order.createdAt,
      transactionId: order.transactionId,
      error: order.excecutionError,
    };
  }
}
