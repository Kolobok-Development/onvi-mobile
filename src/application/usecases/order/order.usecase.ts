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

@Injectable()
export class OrderUsecase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async create(
    data: CreateOrderDto,
    account: Client,
  ): Promise<CarwashResponseDto> {
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

    const order: Order = Order.create({
      card: account.getCard(),
      transactionId: data.transactionId,
      sum: data.sum,
      promoCodeId: data.promoCodeId,
      rewardPointsUsed: data.rewardPointsUsed,
      carWashId: data.carWashId,
      bayNumber: data.bayNumber,
    });

    const newOrder = await this.orderRepository.create(order);

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
}
