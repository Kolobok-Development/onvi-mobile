import {Inject, Injectable} from '@nestjs/common';
import {IOrderRepository} from '../../../domain/order/order-repository.abstract';
import {Logger} from 'nestjs-pino';
import {IPosService} from '../../../infrastructure/pos/interface/pos.interface';
import {
    CardForOrderNotFoundException,
    InvalidOrderStateException,
    OrderNotFoundException,
} from '../../../domain/order/exceptions/order-base.exceptions';
import {OrderStatus} from '../../../domain/order/enum/order-status.enum';
import {SendStatus} from '../../../infrastructure/order/enum/send-status.enum';
import {CarwashStartFailedException} from '../../../domain/order/exceptions/pos-start-faild.exception';
import {DeviceType} from "../../../domain/order/enum/device-type.enum";
import {Order} from "../../../domain/order/model/order";
import {IGazpromRepository} from "../../../domain/partner/gazprom/gazprom-repository.abstract";
import {IPartnerRepository} from "../../../domain/partner/partner-repository.abstract";
import {PartnerOfferStatusEnum} from "../../../infrastructure/partner/enum/partner-offer-status.enum";

@Injectable()
export class StartPosUseCase {
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly VERIFICATION_DELAY_MS = 5000; // 5 seconds

  constructor(
    private readonly orderRepository: IOrderRepository,
    @Inject(Logger) private readonly logger: Logger,
    private readonly posService: IPosService,
    private readonly gazpromRepository: IGazpromRepository,
    private readonly partnerRepository: IPartnerRepository,
  ) {}

  async execute(orderId: number): Promise<any> {
    console.log('start pos data, orderId: ' + orderId);
    const order = await this.orderRepository.findOneById(orderId);
    const isFreeVacuum = order.sum === 0 && order.bayType === DeviceType.VACUUME;

    if (!order) {
      throw new OrderNotFoundException(orderId.toString());
    }

    if (!order.card) throw new CardForOrderNotFoundException(order.id.toString());

    // Verify order is in PAYED status
    if(isFreeVacuum && order.orderStatus !== OrderStatus.FREE_PROCESSING) {
      console.log('err free vacuum')
      throw new InvalidOrderStateException(
          order.id.toString(),
          order.orderStatus,
          OrderStatus.FREE_PROCESSING,
      );
    } else if (order.orderStatus !== OrderStatus.PAYED) {
        console.log('err payed')
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
      console.log(bayDetails)

      // Send start command to carwash
      const carWashResponse = await this.posService.send({
        cardNumber: order.card.devNomer,
        sum: (order.sum + order.rewardPointsUsed).toString(),
        deviceId: bayDetails.id,
      });

      console.log('send pos data, deviceId: ' + bayDetails.id);

      if (carWashResponse.sendStatus === SendStatus.FAIL) {
        throw new CarwashStartFailedException(carWashResponse.errorMessage);
      }

      // Verify carwash has actually started with retries
      const startSuccess = await this.verifyCarWashStarted(
        order, bayDetails.id
      );

      if (!startSuccess) {
        throw new CarwashStartFailedException(
          'Car wash bay did not start after multiple verification attempts',
        );
      }

      order.orderStatus = OrderStatus.COMPLETED;
      await this.orderRepository.update(order);
      await this.sendGazprom(order, PartnerOfferStatusEnum.SUCCESS);

      this.logger.log(
        {
          orderId: order.id,
          action: 'order_completed',
          timestamp: new Date(),
          details: JSON.stringify(carWashResponse),
        },
        `Order completed ${order.id}`,
      );

      console.log('end pos data, status: ' + OrderStatus.COMPLETED);
      return {
        orderId: order.id,
        orderStatus: OrderStatus.COMPLETED,
        posStatus: carWashResponse.sendStatus,
      };
    } catch (error: any) {
      console.log('err')
      order.orderStatus = OrderStatus.FAILED;
      order.excecutionError = error.message;
      await this.orderRepository.update(order);
      await this.sendGazprom(order, PartnerOfferStatusEnum.FAILED);
      console.log('end pos data, status: ' + OrderStatus.FAILED);

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

  private async verifyCarWashStarted(
      order: Order,
      deviceId: string,
  ): Promise<boolean> {
    const carWashId = order.carWashId;
    const bayNumber = order.bayNumber;
    const bayType = order.bayType;
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

        if (attempts > 1) {
            try {
                this.logger.log(`Re-sending start command (attempt ${attempts})`);
                const carWashResponse = await this.posService.send({
                    cardNumber: order.card.devNomer,
                    sum: (order.sum + order.rewardPointsUsed).toString(),
                    deviceId: deviceId,
                });
                console.log('send pos data, deviceId: ' + deviceId);
            } catch (error) {
                this.logger.error(`Failed to re-send start command: ${error.message}`);
            }
        }

      // Wait for the specified delay
      await this.sleep(this.VERIFICATION_DELAY_MS);

      try {
        // Ping the bay to see if it's busy (which means it started)
        const pingResult = await this.posService.ping({
          posId: carWashId,
          bayNumber: bayNumber,
          type: bayType,
        });

        // If the bay is busy, it means the car wash started successfully
        if (pingResult.status !== 'Free') {
          console.log('send pos data success: ' + deviceId);
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

  private async sendGazprom(order: Order, status: PartnerOfferStatusEnum): Promise<void> {
      const clientPartner = await this.partnerRepository.findPartnerClientByClientIdAndPartnerId(order.card.clientId, 2921);
      if(clientPartner) {
          console.log('start send Gazprom: ' + clientPartner.id);
          await this.gazpromRepository.updateData(
              clientPartner.partnerUserId,
              { meta:
                      {
                          bonus_points: order.cashback.toString(),
                          last_visit: order.createdAt,
                          offer_status: status
                      }
              }
          )
      }
  }
}
