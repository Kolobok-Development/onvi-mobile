import { Inject, Injectable } from '@nestjs/common';
import { IOrderRepository } from '../../../domain/order/order-repository.abstract';
import { PaymentUsecase } from '../payment/payment.usecase';
import { IRegisterPaymentDto } from './dto/register-payment.dto';
import {
  InvalidOrderStateException,
  OrderNotFoundException,
} from '../../../domain/order/exceptions/order-base.exceptions';
import { OrderStatus } from '../../../domain/order/enum/order-status.enum';
import { CreatePaymentDto } from '../payment/dto/create-payment.dto';
import { PaymentRegistrationFailedException } from '../../../domain/payment/exceptions/payment-base.exceptions';
import { Logger } from 'nestjs-pino';

@Injectable()
export class RegisterPaymentUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly paymentUsecase: PaymentUsecase,
    @Inject(Logger) private readonly logger: Logger,
  ) {}

  async execute(data: IRegisterPaymentDto): Promise<any> {
    const order = await this.orderRepository.findOneById(data.orderId);

    if (!order) {
      throw new OrderNotFoundException(data.orderId.toString());
    }

    if (order.orderStatus !== OrderStatus.CREATED) {
      throw new InvalidOrderStateException(
        order.id.toString(),
        order.orderStatus,
        OrderStatus.CREATED,
      );
    }

    try {
      const updatedOrder = {
        ...order,
        orderStatus: OrderStatus.PAYMENT_PROCESSING,
      };
      await this.orderRepository.update(updatedOrder);

      this.logger.log(
        {
          orderId: order.id,
          action: 'payment_processing',
          timestamp: new Date(),
          details: JSON.stringify({
            paymentToken: data.paymentToken,
            amount: data.amount,
          }),
        },
        `Payment processing initiated for order ${order.id} with amount ${data.amount}`,
      );

      // Register payment with payment service (YooKassa)
      const paymentData: CreatePaymentDto = {
        paymentToken: data.paymentToken,
        amount: data.amount,
        description: `Оплата за мойку, пост № ${order.bayNumber}`,
      };
      const paymentResult = await this.paymentUsecase.create(
        paymentData,
        data.receiptReturnPhoneNumber,
      );

      // Update order with payment ID and status
      const finalOrder = await this.orderRepository.findOneById(order.id);
      const finalOrderUpdate = {
        ...finalOrder,
        orderStatus: OrderStatus.WAITING_PAYMENT,
        transactionId: paymentResult.id,
      };
      await this.orderRepository.update(finalOrderUpdate);

      this.logger.log(
        {
          orderId: order.id,
          action: 'payment_registered',
          timestamp: new Date(),
          details: JSON.stringify(paymentResult),
        },
        `Payment has been registered for order ${order.id} with amount ${data.amount}`,
      );

      console.log(paymentResult)
      return {
        status: OrderStatus.WAITING_PAYMENT,
        paymentId: paymentResult.id,
        confirmation_url: paymentResult.confirmation.confirmation_url,
      };
    } catch (error: any) {
      order.orderStatus = OrderStatus.CANCELED;
      order.excecutionError = error.message;

      await this.orderRepository.update(order);

      this.logger.error(
        {
          orderId: order.id,
          action: 'payment_failed',
          timestamp: new Date(),
          details: JSON.stringify({
            error: error.message,
          }),
        },
        `Payment has been registered for order ${order.id} with amount ${data.amount}`,
      );

      throw new PaymentRegistrationFailedException(error.message);
    }
  }
}
