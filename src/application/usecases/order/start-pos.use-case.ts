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
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly VERIFICATION_DELAY_MS = 5000; // 5 seconds

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
        const remainingBalance = await this.withdrawRewardPoints(
          bayDetails.id,
          order.card.devNomer,
          order.rewardPointsUsed,
          balance,
        );
        balance = remainingBalance;
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

      // Verify carwash has actually started with retries
      const startSuccess = await this.verifyCarWashStarted(
        order.carWashId,
        order.bayNumber,
      );

      if (!startSuccess) {
        throw new CarwashStartFailedException(
          'Car wash bay did not start after multiple verification attempts',
        );
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

      throw error;
    }
  }

  /**
   * Verifies that the car wash bay has actually started by checking if it's busy
   * Retries up to MAX_RETRY_ATTEMPTS with a delay between attempts
   *
   * @param carWashId - The ID of the car wash
   * @param bayNumber - The bay number to check
   * @returns true if verification was successful, false otherwise
   */
  private async verifyCarWashStarted(
    carWashId: number,
    bayNumber: number,
  ): Promise<boolean> {
    let attempts = 0;

    while (attempts < this.MAX_RETRY_ATTEMPTS) {
      attempts++;

      this.logger.log(
        {
          action: 'verify_carwash_started',
          carWashId,
          bayNumber,
          attempt: attempts,
          timestamp: new Date(),
        },
        `Verifying car wash started - attempt ${attempts}/${this.MAX_RETRY_ATTEMPTS}`,
      );

      // Wait for the specified delay
      await this.sleep(this.VERIFICATION_DELAY_MS);

      try {
        // Ping the bay to see if it's busy (which means it started)
        const pingResult = await this.posService.ping({
          posId: carWashId,
          bayNumber: bayNumber,
        });

        // If the bay is busy, it means the car wash started successfully
        if (pingResult.status !== 'Free') {
          this.logger.log(
            {
              action: 'verify_carwash_started_success',
              carWashId,
              bayNumber,
              attempt: attempts,
              timestamp: new Date(),
            },
            `Car wash verified as started on attempt ${attempts}`,
          );
          return true;
        }

        this.logger.log(
          {
            action: 'verify_carwash_still_available',
            carWashId,
            bayNumber,
            attempt: attempts,
            timestamp: new Date(),
          },
          `Car wash bay still shows as available, retrying...`,
        );

        // If we're at the max attempts, we'll exit the loop and return false
        if (attempts >= this.MAX_RETRY_ATTEMPTS) {
          this.logger.error(
            {
              action: 'verify_carwash_failed',
              carWashId,
              bayNumber,
              timestamp: new Date(),
            },
            `Failed to verify car wash started after ${this.MAX_RETRY_ATTEMPTS} attempts`,
          );
        }
      } catch (error) {
        this.logger.error(
          {
            action: 'verify_carwash_ping_error',
            carWashId,
            bayNumber,
            attempt: attempts,
            error: error.message,
            timestamp: new Date(),
          },
          `Error pinging car wash during verification: ${error.message}`,
        );

        // Continue to next attempt despite error
      }
    }

    return false;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
