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

@Injectable()
export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly promoCodeService: PromoCodeService,
    private readonly tariffRepository: ITariffRepository,
    private readonly posService: IPosService,
    @Inject(Logger) private readonly logger: Logger,
  ) {}

  async execute(request: CreateOrderDto, account: Client): Promise<any> {
    // Step 1: Verify bay availability via ping request
    await this.verifyBayAvailability(request);

    // Step 2: Create order with initial CREATED status
    const card = account.getCard();
    const tariff = await this.tariffRepository.findCardTariff(card);
    const cashback = Math.ceil((request.sum * tariff.bonus) / 100);

    const order = Order.create({
      card: card,
      status: OrderStatus.CREATED, // Set initial status
      sum: request.sum,
      promoCodeId: request.promoCodeId ?? null,
      rewardPointsUsed: request.rewardPointsUsed,
      carWashId: request.carWashId,
      bayNumber: request.bayNumber,
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
      `Order created ${order.id}`,
    );

    return {
      orderId: newOrder.id,
      status: OrderStatus.CREATED,
    };
  }

  private async verifyBayAvailability(data: CreateOrderDto): Promise<void> {
    const requestBody: PingRequestDto = {
      posId: data.carWashId,
      bayNumber: data.bayNumber,
    };
    const bay = await this.posService.ping(requestBody);

    if (bay.status === 'Busy') {
      throw new BayBusyException(data.bayNumber);
    } else if (bay.status === 'Unavailable') {
      throw new CarwashUnavalibleException();
    }
  }
}
