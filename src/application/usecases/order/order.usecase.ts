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
import { PaymentUsecase } from '../payment/payment.usecase';
import { PaymentStatus } from '../../../domain/payment/model/payment';
import { IAccountRepository } from '../../../domain/account/interface/account-repository.interface';

@Injectable()
export class OrderUsecase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly promoCodeRepository: IPromoCodeRepository,
    private readonly paymentUsecase: PaymentUsecase,
    private readonly accountRepository: IAccountRepository,
  ) {}

  async create(data: CreateOrderDto, account: Client): Promise<any> {
    let newOrder;

    //ping carwash
    const bay: BayResponseDto = await this.orderRepository.ping(
      data.carWashId,
      data.bayNumber,
    );

    if (bay.status === 'Busy') {
      throw new BayBusyException(data.bayNumber);
    } else if (bay.status === 'Unavailable') {
      throw new CarwashUnavalibleException();
    }

    //Verify payment
    const paymentStatus = await this.paymentUsecase.verify(data.transactionId);

    if (paymentStatus.status !== PaymentStatus.SUCCEEDED) {
      throw new OrderProcessingException();
    }

    const card = account.getCard();
    const tariff = await this.accountRepository.findCardTariff(card);
    const cashback = Math.ceil((data.sum * tariff.bonus) / 100);

    const order: Order = Order.create({
      card: card,
      transactionId: data.transactionId,
      sum: data.sum,
      promoCodeId: data.promoCodeId ?? null,
      rewardPointsUsed: data.rewardPointsUsed,
      carWashId: data.carWashId,
      bayNumber: data.bayNumber,
      cashback: cashback,
    });

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

      let promoCodeUsage = await this.promoCodeRepository.findMaxUsageByCard(
          card.cardId,
          promoCode.id,
      );
      if (promoCodeUsage === null) {
        promoCodeUsage = 1;
      } else {
        promoCodeUsage = promoCodeUsage + 1;
      }
      await this.promoCodeRepository.apply(
        promoCode,
        account.getCard(),
        order.carWashId,
        promoCodeUsage
      );

    } else {
      newOrder = await this.orderRepository.create(order);
    }

    if (!newOrder) throw new OrderProcessingException();

    //Widthdraw points from the account

    if (order.rewardPointsUsed > 0) {
      if (card.balance < newOrder.rewardPointsUsed)
        throw new OrderProcessingException();

      const withdraw = await this.orderRepository.withdraw(
        bay.id,
        card.devNomer,
        newOrder.rewardPointsUsed.toString(),
        '1',
      );

      //Apply reward points through transaction
      if (!withdraw) throw new OrderProcessingException();
    }

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

    const promoCodeUsage = await this.promoCodeRepository.findMaxUsageByCard(
        card.cardId,
        promoCode.id,
    );
    if (
        promoCodeUsage >= promoCode.usageAmount
    ) {
      throw new InvalidPromoCodeException(promoCode.code);
    }
/*
    //check for usage of promocode
    const isUsed = await this.promoCodeRepository.validateUsageByCard(
      card.cardId,
      promoCode.id,
    );

    if (!isUsed) {
      throw new InvalidPromoCodeException(promoCode.code);
    }
*/
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
