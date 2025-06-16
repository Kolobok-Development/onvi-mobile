import { Inject, Injectable } from '@nestjs/common';
import { IOrderRepository } from '../../../domain/order/order-repository.abstract';
import { Logger } from 'nestjs-pino';
import { IPosService } from '../../../infrastructure/pos/interface/pos.interface';
import {
  CardForOrderNotFoundException,
  InvalidOrderStateException,
  OrderNotFoundException,
} from '../../../domain/order/exceptions/order-base.exceptions';
import { OrderStatus } from '../../../domain/order/enum/order-status.enum';
import { SendStatus } from '../../../infrastructure/order/enum/send-status.enum';
import { CarwashStartFailedException } from '../../../domain/order/exceptions/pos-start-faild.exception';
import { DeviceType } from '../../../domain/order/enum/device-type.enum';
import { Order } from '../../../domain/order/model/order';
import { IGazpromRepository } from '../../../domain/partner/gazprom/gazprom-repository.abstract';
import { IPartnerRepository } from '../../../domain/partner/partner-repository.abstract';
import { PartnerOfferStatusEnum } from '../../../infrastructure/partner/enum/partner-offer-status.enum';

@Injectable()
export class StartPosUseCase {

  constructor(
    private readonly orderRepository: IOrderRepository,
    @Inject(Logger) private readonly logger: Logger,
    private readonly posService: IPosService,
    private readonly gazpromRepository: IGazpromRepository,
    private readonly partnerRepository: IPartnerRepository,
  ) {}

  async execute(orderId: number): Promise<any> {
    const order = await this.orderRepository.findOneById(orderId);

    const isFreeVacuum =
      order.sum === 0 && order.bayType === DeviceType.VACUUME;

    if (!order) {
      throw new OrderNotFoundException(orderId.toString());
    }

    if (!order.card)
      throw new CardForOrderNotFoundException(order.id.toString());

    // Verify order is in PAYED status or Free order
    if (isFreeVacuum && order.orderStatus !== OrderStatus.FREE_PROCESSING) {
      order.orderStatus = OrderStatus.FAILED;
      await this.orderRepository.update(order);
      throw new InvalidOrderStateException(
        order.id.toString(),
        order.orderStatus,
        OrderStatus.FREE_PROCESSING,
      );
    } else if (!isFreeVacuum && order.orderStatus !== OrderStatus.PAYED) {
      order.orderStatus = OrderStatus.FAILED;
      await this.orderRepository.update(order);
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
        type: order.bayType,
      });

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
      const startSuccess: boolean = await this.verifyCarWashStartedRecursive(
        order,
        bayDetails.id,
        1,
      );

      if (!startSuccess) {
        throw new CarwashStartFailedException(
          'Car wash bay did not start after multiple verification attempts',
        );
      }

      order.orderStatus = OrderStatus.COMPLETED;
      await this.orderRepository.update(order);
      await this.sendGazprom(order, PartnerOfferStatusEnum.ACTIVE);

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
      };
    } catch (error: any) {
      order.orderStatus = OrderStatus.FAILED;
      order.excecutionError = error.message;
      await this.orderRepository.update(order);
      await this.sendGazprom(order, PartnerOfferStatusEnum.FAILED);

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

  private async verifyCarWashStartedRecursive(
    order: Order,
    deviceId: string,
    cycle: number,
  ): Promise<boolean> {
    const carWashId = order.carWashId;
    const bayNumber = order.bayNumber;
    const MAX_RETRY_CYCLES = 3;

    if (cycle > MAX_RETRY_CYCLES) {
      this.logger.error(
        {
          action: 'verify_carwash_failed_final',
          carWashId,
          bayNumber,
          totalCycles: MAX_RETRY_CYCLES,
          timestamp: new Date(),
        },
        `Failed to verify car wash started after ${MAX_RETRY_CYCLES} cycles`,
      );
      return false;
    }


    // Try 4 ping attempts
    const pingResult = await this.performPingAttempts(order, cycle);

    if (pingResult.success) {
      this.logger.log(`Car wash verified as started on cycle ${cycle}`);
      return true;
    }

    // If not the last cycle, resend command and try again
    if (cycle < MAX_RETRY_CYCLES) {
      this.logger.log(`Resending start command after cycle ${cycle}`);

      try {
        await this.posService.send({
          cardNumber: order.card.devNomer,
          sum: (order.sum + order.rewardPointsUsed).toString(),
          deviceId: deviceId,
        });

        await this.sleep(1000); // Brief delay before next cycle

        // Recursive call for next cycle
        return this.verifyCarWashStartedRecursive(order, deviceId, cycle + 1);
      } catch (error) {
        this.logger.error(`Failed to resend start command: ${error.message}`);

        // Continue to next cycle even if resend failed
        await this.sleep(1000);
        return this.verifyCarWashStartedRecursive(order, deviceId, cycle + 1);
      }
    }

    return false;
  }

  private async performPingAttempts(
    order: Order,
    cycle: number,
  ): Promise<{ success: boolean }> {
    const carWashId = order.carWashId;
    const bayNumber = order.bayNumber;
    const bayType = order.bayType;
    const MAX_PING_ATTEMPTS = 5;
    const INITIAL_DELAY_MS = 3000;
    const DELAY_INCREMENT_MS = 1000;

    for (let pingAttempt = 1; pingAttempt <= MAX_PING_ATTEMPTS; pingAttempt++) {
      try {
        const pingResult = await this.posService.ping({
          posId: carWashId,
          bayNumber: bayNumber,
          type: bayType,
        });

        if (pingResult.status !== 'Free') {
          return { success: true };
        }

        // Wait before next ping (except for last attempt)
        if (pingAttempt < MAX_PING_ATTEMPTS) {
          const currentDelay =
            INITIAL_DELAY_MS + (pingAttempt - 1) * DELAY_INCREMENT_MS;
          await this.sleep(currentDelay);
        }
      } catch (error) {
        this.logger.error(
          `Error pinging car wash on cycle ${cycle}, ping ${pingAttempt}: ${error.message}`,
        );

        if (pingAttempt < MAX_PING_ATTEMPTS) {
          const currentDelay =
            INITIAL_DELAY_MS + (pingAttempt - 1) * DELAY_INCREMENT_MS;
          await this.sleep(currentDelay);
        }
      }
    }

    return { success: false };
  }

  private async sleep(ms: number): Promise<unknown> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async sendGazprom(
    order: Order,
    status: PartnerOfferStatusEnum,
  ): Promise<void> {
    const clientPartner =
      await this.partnerRepository.findPartnerClientByClientIdAndPartnerId(
        order.card.clientId,
        2921,
      );
    if (clientPartner) {
      console.log('start send Gazprom: ' + clientPartner.id);
      await this.gazpromRepository.updateData(clientPartner.partnerUserId, {
        meta: {
          bonus_points: order.cashback.toString(),
          last_visit: order.createdAt,
          offer_status: status,
        },
      });
    }
  }
}
