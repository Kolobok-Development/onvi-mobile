import { Inject, Injectable } from '@nestjs/common';
import { IOrderRepository } from '../../../domain/order/order-repository.abstract';
import { ITariffRepository } from '../../../domain/account/card/tariff-repository.abstract';
import { IPosService } from '../../../infrastructure/pos/interface/pos.interface';
import { CreateOrderDto } from './dto/create-order.dto';
import { Client } from '../../../domain/account/client/model/client';
import { Order } from '../../../domain/order/model/order';
import { BayBusyException } from '../../../domain/order/exceptions/bay-busy.exception';
import { CarwashUnavalibleException } from '../../../domain/order/exceptions/carwash-unavalible.exception';
import { PingRequestDto } from '../../../infrastructure/pos/dto/ping-request.dto';
import { OrderStatus } from '../../../domain/order/enum/order-status.enum';
import { PromoCodeService } from '../../services/promocode-service';
import { OrderCreationFailedException } from '../../../domain/order/exceptions/order-base.exceptions';
import { Logger } from 'nestjs-pino';
import { DeviceType } from "../../../domain/order/enum/device-type.enum";
import { CardService } from "../../services/card-service";
import { InsufficientFreeVacuumException } from "../../../domain/order/exceptions/insufficient-free-vacuum.exception";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";

@Injectable()
export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly promoCodeService: PromoCodeService,
    private readonly cardService: CardService,
    private readonly tariffRepository: ITariffRepository,
    private readonly posService: IPosService,
    @Inject(Logger) private readonly logger: Logger,
    @InjectQueue('pos-process') private readonly dataQueue: Queue,
  ) { }

  async execute(request: CreateOrderDto, account: Client): Promise<any> {

    const isFreeVacuum = request.sum === 0 && request.bayType === DeviceType.VACUUME;

    if (request.err) {
      await this.simulateRandomError(request, account);
    }

    // Step 1: Verify bay availability via ping request
    await this.verifyBayAvailability(request);

    // Step 2: Create order with initial CREATED status
    const card = account.getCard();
    const tariff = await this.tariffRepository.findCardTariff(card);
    const cashback = ((request.sum * tariff.bonus) / 100) < 1 ? 0 : Math.ceil((request.sum * tariff.bonus) / 100);
    
    if (isFreeVacuum) {

      const vacuumInfo = await this.cardService.getFreeVacuum(account);
      if (vacuumInfo.remains <= 0) {
        throw new InsufficientFreeVacuumException();
      }

      const order = Order.create({
        card: card,
        status: OrderStatus.FREE_PROCESSING, // Set initial status
        sum: request.sum,
        originalSum: request.originalSum,
        promoCodeId: request.promoCodeId ?? null,
        rewardPointsUsed: request.rewardPointsUsed,
        carWashId: request.carWashId,
        bayNumber: request.bayNumber,
        bayType: request.bayType ?? DeviceType.BAY,
        cashback: cashback,
      });

      const newOrder = await this.orderRepository.create(order);
      //add to the task
      await this.dataQueue.add('pos-process', {
        orderId: newOrder.id,
      });

      return {
        orderId: newOrder.id,
        status: newOrder.orderStatus,
      };
    } else {
      const order = Order.create({
        card: card,
        status: OrderStatus.CREATED, // Set initial status
        sum: request.sum,
        originalSum: request.originalSum,
        promoCodeId: request.promoCodeId ?? null,
        rewardPointsUsed: request.rewardPointsUsed,
        carWashId: request.carWashId,
        bayNumber: request.bayNumber,
        bayType: request.bayType ?? DeviceType.BAY,
        cashback: cashback,
      });

      // Apply promo code if applicable
      if (order.promoCodeId) {
        order.discountAmount = await this.promoCodeService.applyPromoCode(
          order,
          card,
        );
      }

      // Step 6: Save the order
      const newOrder = await this.orderRepository.create(order);
      if (!newOrder) {
        throw new OrderCreationFailedException();
      }

      // Log order creation
      this.logger.log(
        {
          orderId: order.id,
          action: 'order_created',
          timestamp: new Date(),
          details: {
            orderId: order.id,
            clientId: account.clientId,
          },
        },
        `Order created ${order.id} `,
      );

      return {
        orderId: newOrder.id,
        status: newOrder.orderStatus,
      };
    }
  }

  private async verifyBayAvailability(data: CreateOrderDto): Promise<void> {
    const requestBody: PingRequestDto = {
      posId: data.carWashId,
      bayNumber: data.bayNumber,
      type: data.bayType,
    };
    const bay = await this.posService.ping(requestBody);

    if (bay.status === 'Busy') {
      throw new BayBusyException(data.bayNumber);
    } else if (bay.status === 'Unavailable') {
      throw new CarwashUnavalibleException();
    }
  }


  private async simulateRandomError(request: CreateOrderDto, account: Client): Promise<void> {
    // Список возможных ошибок для симуляцииAdd commentMore actions
    const errorScenarios = [
      {
        name: 'BayBusy',
        condition: () => Math.random() < 0.5, // 20% chance
        action: () => {
          throw new BayBusyException(request.bayNumber);
        }
      },
      {
        name: 'CarwashUnavailable',
        condition: () => Math.random() < 0.5, // 20% chance
        action: () => {
          throw new CarwashUnavalibleException();
        }
      },
      {
        name: 'InsufficientFreeVacuum',
        condition: () => request.sum === 0 &&
          request.bayType === DeviceType.VACUUME &&
          Math.random() < 0.3, // 30% chance for free vacuum
        action: () => {
          throw new InsufficientFreeVacuumException();
        }
      },
      {
        name: 'OrderCreationFailed',
        condition: () => Math.random() < 0.5,
        action: () => {
          throw new OrderCreationFailedException();
        }
      },
    ];

    // Проверяем каждую возможную ошибку
    for (const scenario of errorScenarios) {
      if (scenario.condition()) {
        this.logger.log(`Simulating error: ${scenario.name} `);
        scenario.action();
        break; // Останавливаем после первой сработавшей ошибки
      }
    }
  }
}
