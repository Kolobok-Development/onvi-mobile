import { Injectable } from '@nestjs/common';
import { IOrderRepository } from '../../../domain/order/order-repository.abstract';
import { ITransactionRepository } from '../../../domain/transaction/transaction-repository.abstract';
import { IPromoCodeRepository } from '../../../domain/promo-code/promo-code-repository.abstract';
import { PaymentUsecase } from '../payment/payment.usecase';
import { ITariffRepository } from '../../../domain/account/card/tariff-repository.abstract';
import { IPosService } from '../../../infrastructure/pos/interface/pos.interface';
import { CreateOrderDto } from './dto/create-order.dto';
import { Client } from '../../../domain/account/client/model/client';
import { Order } from '../../../domain/order/model/order';
import { PingResponseDto } from '../../../infrastructure/pos/dto/ping-response.dto';
import { SendResponseDto } from '../../../infrastructure/pos/dto/send-response.dto';
import { SendStatus } from '../../../infrastructure/order/enum/send-status.enum';
import { SendRequestDto } from '../../../infrastructure/pos/dto/send-request.dto';
import { Card } from '../../../domain/account/card/model/card';
import { PaymentStatus } from '../../../domain/payment/model/payment';
import { BayBusyException } from '../../../domain/order/exceptions/bay-busy.exception';
import { CarwashUnavalibleException } from '../../../domain/order/exceptions/carwash-unavalible.exception';
import { PingRequestDto } from '../../../infrastructure/pos/dto/ping-request.dto';
import { PaymentCanceledException } from '../../../domain/order/exceptions/payment-canceled.exception';
import { PaymentTimeoutException } from '../../../domain/order/exceptions/payment-time-out.exception';
import { InsufficientRewardPointsException } from '../../../domain/order/exceptions/insufficient-reward-roints.exception';
import { RewardPointsWithdrawalException } from '../../../domain/order/exceptions/reward-points-withdrawal.exception';
import { OrderStatus } from '../../../domain/order/enum/order-status.enum';
import { PromoCodeService } from '../../services/promocode-service';
import {IPartnerRepository} from "../../../domain/partner/partner-repository.abstract";
import {IGazpromRepository} from "../../../domain/partner/gazprom/gazprom-repository.abstract";
import {PartnerOfferStatusEnum} from "../../../infrastructure/partner/enum/partner-offer-status.enum";

@Injectable()
export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly transactionRepository: ITransactionRepository,
    private readonly promoCodeService: PromoCodeService,
    private readonly paymentUsecase: PaymentUsecase,
    private readonly tariffRepository: ITariffRepository,
    private readonly posService: IPosService,
    private readonly gazpromRepository: IGazpromRepository,
    private readonly partnerRepository: IPartnerRepository,
  ) {}

  async execute(request: CreateOrderDto, account: Client): Promise<any> {
    // Step 1: Verify bay availability
    const bay = await this.verifyBayAvailability(request);

    // Step 2: Verify payment
    //await this.verifyPayment(request.transactionId);

    // Step 3: Get card and tariff details
    const card = account.getCard();
    const tariff = await this.tariffRepository.findCardTariff(card);
    const cashback = Math.ceil((request.sum * tariff.bonus) / 100);

    // Step 4: Create the order
    const order = this.createOrder(request, card, cashback);


    // Step 5: Apply promo code if applicable using PromoCodeService
    if (order.promoCodeId) {
      const discountAmount = await this.promoCodeService.applyPromoCode(
        order,
        card,
      );
      order.discountAmount = discountAmount;
    }

    // Step 6: Save the order
    const newOrder = await this.orderRepository.create(order);
    if (!newOrder) {
      throw new Error('Failed to create order.');
    }

    // Step 7: Withdraw reward points if used
    if (order.rewardPointsUsed > 0) {
      await this.withdrawRewardPoints(order, newOrder, bay, card);
    }

    // Step 8: Process order at the car wash
    const carWashResponse = await this.processOrderAtCarWash(
      order,
      bay,
      newOrder,
    );

    // Step 9: Mark the order as completed
    await this.orderRepository.updateOrderStatus(
      newOrder.id,
      OrderStatus.COMPLETED,
    );


    console.log(order)
    await this.sendGazprom(order, PartnerOfferStatusEnum.SUCCESS);


    return carWashResponse;
  }

  private async verifyBayAvailability(
    data: CreateOrderDto,
  ): Promise<PingResponseDto> {
    const requestBody: PingRequestDto = {
      posId: data.carWashId,
      bayNumber: data.bayNumber,
      type: data?.bayType,
    };
    const bay = await this.posService.ping(requestBody);

    if (bay.status === 'Busy') {
      throw new BayBusyException(data.bayNumber);
    } else if (bay.status === 'Unavailable') {
      throw new CarwashUnavalibleException();
    }

    return bay;
  }

  private async verifyPayment(transactionId: string): Promise<void> {
    const maxAttempts = 3; // Maximum number of polling attempts
    const interval = 2000; // 2 seconds delay between attempts

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const paymentStatus = await this.paymentUsecase.verify(transactionId);

      if (paymentStatus === PaymentStatus.SUCCEEDED) {
        return; // Payment succeeded, exit the loop
      }

      if (paymentStatus === PaymentStatus.CANCELED) {
        throw new PaymentCanceledException(transactionId);
      }

      if (
        paymentStatus === PaymentStatus.PENDING ||
        paymentStatus === PaymentStatus.WAITING
      ) {
        console.log(
          `Payment is still processing (attempt ${attempt}). Retrying...`,
        );
        await this.sleep(interval); // Wait before the next attempt
      }
    }

    // If we exceed max attempts, throw a timeout exception
    throw new PaymentTimeoutException(transactionId);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private createOrder(
    data: CreateOrderDto,
    card: Card,
    cashback: number,
  ): Order {
    return Order.create({
      card,
      transactionId: data.transactionId,
      sum: data.sum,
      promoCodeId: data.promoCodeId ?? null,
      rewardPointsUsed: data.rewardPointsUsed,
      carWashId: data.carWashId,
      bayNumber: data.bayNumber,
      cashback,
    });
  }

  private async withdrawRewardPoints(
    order: Order,
    newOrder: Order,
    bay: PingResponseDto,
    card: Card,
  ): Promise<void> {
    if (card.balance < order.rewardPointsUsed) {
      throw new InsufficientRewardPointsException();
    }

    const withdraw = await this.transactionRepository.withdraw(
      bay.id,
      card.devNomer,
      order.rewardPointsUsed.toString(),
      '1',
    );

    if (!withdraw) {
      throw new RewardPointsWithdrawalException();
    }
  }

  private async processOrderAtCarWash(
    order: Order,
    bay: PingResponseDto,
    newOrder: Order,
  ): Promise<SendResponseDto> {
    const requestBody: SendRequestDto = {
      cardNumber: order.card.devNomer,
      sum: (order.sum + order.rewardPointsUsed).toString(),
      deviceId: bay.id,
    };
    const carWashResponse = await this.posService.send(requestBody);

    if (carWashResponse.sendStatus === SendStatus.FAIL) {
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

    return carWashResponse;
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
