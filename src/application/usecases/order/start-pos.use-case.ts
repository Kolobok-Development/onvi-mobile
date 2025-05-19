import { Inject, Injectable } from '@nestjs/common';
import { IOrderRepository } from '../../../domain/order/order-repository.abstract';
import { Logger } from 'nestjs-pino';
import { IPosService } from '../../../infrastructure/pos/interface/pos.interface';
import {
  InvalidOrderStateException,
  OrderNotFoundException,
} from '../../../domain/order/exceptions/order-base.exceptions';
import { OrderStatus } from '../../../domain/order/enum/order-status.enum';
import { ITransactionRepository } from '../../../domain/transaction/transaction-repository.abstract';
import { RewardPointsWithdrawalException } from '../../../domain/order/exceptions/reward-points-withdrawal.exception';
import { SendStatus } from '../../../infrastructure/order/enum/send-status.enum';
import { CarwashStartFailedException } from '../../../domain/order/exceptions/pos-start-faild.exception';

@Injectable()
export class StartPosUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    @Inject(Logger) private readonly logger: Logger,
    private readonly posService: IPosService,
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(orderId: number): Promise<any> {
    const order = await this.orderRepository.findOneById(orderId);

    if (!order) {
      throw new OrderNotFoundException(orderId.toString());
    }

    let balance = order.card.balance;

    // Verify order is in PAYED status
    if (order.orderStatus !== OrderStatus.PAYED) {
      throw new InvalidOrderStateException(
        order.id.toString(),
        order.orderStatus,
        OrderStatus.PAYED,
      );
    }

    try {
      // Get bay details
      const bayDetails = await this.posService.ping({
        posId: order.carWashId,
        bayNumber: order.bayNumber,
      });

      // Withdraw reward points if used
      if (order.rewardPointsUsed > 0) {
        const reaminingBalance = await this.withdrawRewardPoints(
          bayDetails.id,
          order.card.devNomer,
          order.rewardPointsUsed,
          balance,
        );
        balance = reaminingBalance;
      }

      // Send start command to carwash
      const carWashResponse = await this.posService.send({
        cardNumber: order.card.devNomer,
        sum: (order.sum + order.rewardPointsUsed).toString(),
        deviceId: bayDetails.id,
      });

      if (carWashResponse.sendStatus === SendStatus.FAIL) {
        throw new CarwashStartFailedException(carWashResponse.errorMessage);
      }

      order.orderStatus = OrderStatus.COMPLETED;

      await this.orderRepository.update(order);

      this.logger.log(
        {
          orderId: order.id,
          action: 'order_completed',
          timestamp: new Date(),
          details: JSON.stringify(carWashResponse),
        },
        `Order completed ${order.id}`,
      );

      return {
        orderId: order.id,
        orderStatus: OrderStatus.COMPLETED,
        posStatus: carWashResponse.sendStatus,
        balance: balance,
      };
    } catch (error: any) {
      // Withdraw reward points if used
      order.orderStatus = OrderStatus.FAILED;
      order.excecutionError = error.message;
      await this.orderRepository.update(order);

      this.logger.log(
        {
          orderId: order.id,
          action: 'carwash_start_failed',
          timestamp: new Date(),
          details: JSON.stringify({ error: error.message }),
        },
        `Order failed ${order.id}`,
      );
    }
  }

  private async withdrawRewardPoints(
    bayId: string,
    unqNumber: string,
    amount: number,
    balance: number,
  ): Promise<number> {
    const withdraw = await this.transactionRepository.withdraw(
      bayId,
      unqNumber,
      amount.toString(),
      '1',
    );

    if (!withdraw) {
      throw new RewardPointsWithdrawalException();
    }

    return balance - amount;
  }
}
