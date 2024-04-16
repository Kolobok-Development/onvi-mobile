import { Injectable } from '@nestjs/common';
import { IOrderRepository } from '../../../domain/order/order-repository.abstract';
import { CreateOrderDto } from './dto/create-order.dto';
import { Client } from '../../../domain/account/client/model/client';
import { Order } from '../../../domain/order/model/order';
import { BayResponseDto } from '../../../infrastructure/order/dto/bay-response.dto';
import { CarwashResponseDto } from '../../../infrastructure/order/dto/carwash-response.dto';
import { SendStatus } from '../../../infrastructure/order/enum/send-status.enum';
import { OrderStatus } from '../../../domain/order/enum/order-status.enum';
import { BayBusyException } from '../../../domain/order/exceptions/bay-busy.exception';
import { CarwashUnavalibleException } from '../../../domain/order/exceptions/carwash-unavalible.exception';
import { OrderProcessingException } from '../../../domain/order/exceptions/order-processing.exception';
import { IPromoCodeRepository } from '../../../domain/promo-code/promo-code-repository.abstract';
import { VerifyPromoDto } from './dto/verify-promo.dto';
import { PromoCodeLocation } from '../../../domain/promo-code/model/promo-code-location';
import { PromoVerificationResponseDto } from './dto/promo-verification-response.dto';
import { PromoCode } from '../../../domain/promo-code/model/promo-code.model';
import { InvalidPromoCodeException } from '../../../domain/promo-code/exceptions/invalid-promo-code.exception';
import { PromoCodeNotFoundException } from '../../../domain/promo-code/exceptions/promo-code-not-found.exception';

@Injectable()
export class OrderUsecase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly promoCodeRepository: IPromoCodeRepository,
  ) {}

  async create(
    data: CreateOrderDto,
    account: Client,
  ): Promise<CarwashResponseDto> {
    let newOrder;
    console.log(`Begin`);
    console.log(data);
    //ping carwash
    const bay: BayResponseDto = await this.orderRepository.ping(
      data.carWashId,
      data.bayNumber,
    );

    console.log(bay);

    if (bay.status === 'Busy') {
      throw new BayBusyException(data.bayNumber);
    } else if (bay.status === 'Unavailable') {
      throw new CarwashUnavalibleException();
    }

    const order: Order = Order.create({
      card: account.getCard(),
      transactionId: data.transactionId,
      sum: data.sum,
      promoCodeId: data.promoCodeId ?? null,
      rewardPointsUsed: data.rewardPointsUsed,
      carWashId: data.carWashId,
      bayNumber: data.bayNumber,
    });
    console.log(`ORDER: ${order}`);

    if (order.promoCodeId) {
      const promoCode: PromoCode = await this.promoCodeRepository.findOneById(
        order.promoCodeId,
      );

      if (!promoCode) throw new OrderProcessingException();

      if (promoCode.discountType === 1) {
        order.discountAmount = order.sum - promoCode.discount;
      } else if (promoCode.discountType === 2) {
        order.discountAmount = Math.round(
          (promoCode.discount / 100) * order.sum,
        );
      }

      newOrder = await this.orderRepository.create(order);

      await this.promoCodeRepository.apply(
        promoCode,
        account.getCard(),
        order.carWashId,
      );
    } else {
      newOrder = await this.orderRepository.create(order);
    }
    if (!newOrder) throw new OrderProcessingException();

    const carWashResponse: CarwashResponseDto = await this.orderRepository.send(
      order,
      bay,
    );

    if (carWashResponse.sendStatus == SendStatus.FAIL) {
      await Promise.all([
        this.orderRepository.updateOrderStatus(
          newOrder.id,
          OrderStatus.CANCELED,
        ),
        this.orderRepository.setExcecutionError(
          newOrder.id,
          carWashResponse.errorMessage,
        ),
      ]);
      throw new CarwashUnavalibleException();
    }
    await this.orderRepository.updateOrderStatus(
      newOrder.id,
      OrderStatus.COMPLETED,
    );
    return carWashResponse;
  }

  async validatePromo(
    data: VerifyPromoDto,
    client: Client,
  ): Promise<PromoVerificationResponseDto> {
    const card = client.getCard();
    const promoCode = await this.promoCodeRepository.findOneByCode(
      data.promoCode,
    );
    const currentDate = new Date();

    if (!PromoCode) throw new PromoCodeNotFoundException(data.promoCode);

    //validate promocode date
    if (
      promoCode.isActive == 0 ||
      new Date(promoCode.expiryDate) < currentDate
    ) {
      throw new InvalidPromoCodeException(promoCode.code);
    }

    //check for usage of promocode
    const isUsed = await this.promoCodeRepository.validateUsageByCard(
      card.cardId,
      promoCode.id,
    );

    if (!isUsed) {
      throw new InvalidPromoCodeException(promoCode.code);
    }

    // check if promocode is allowed for location
    const isLocationAllowed = promoCode.locations.some(
      (location: PromoCodeLocation) => location.carWashId === data.carWashId,
    );

    if (!isLocationAllowed) {
      throw new InvalidPromoCodeException(promoCode.code);
    }

    return {
      valid: true,
      id: promoCode.id,
      type: promoCode.discountType,
      discount: promoCode.discount,
    };
  }

  async pingCarWash(carWashId: number, bayNumber: number) {
    const bay: BayResponseDto = await this.orderRepository.ping(
      carWashId,
      bayNumber,
    );

    return { carWashId, bayNumber, status: bay.status };
  }
}
