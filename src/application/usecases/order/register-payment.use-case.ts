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
    console.log('start register orderId: ' + data.orderId);
    if (data.err) {
      console.log('start err')
      await this.simulateRealisticErrors(data);
    }

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

      console.log('end register orderId: ' + data.orderId);
      console.log(paymentResult)
      return {
        status: OrderStatus.WAITING_PAYMENT,
        paymentId: paymentResult.id,
        confirmation_url: paymentResult?.confirmation.confirmation_url || '',
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


  private async simulateRealisticErrors(data: IRegisterPaymentDto): Promise<void> {
    // Только ошибки, которые уже могут возникнуть в коде
    const realisticErrorScenarios = [
      {
        name: 'OrderNotFound',
        condition: () => Math.random() < 0.5, // 10% chance
        action: () => {
          throw new OrderNotFoundException(data.orderId.toString());
        }
      },
      {
        name: 'InvalidOrderState',
        condition: () => Math.random() < 0.5, // 15% chance
        action: () => {
          // Только те статусы, которые могут быть в реальности
          const invalidStatus = [OrderStatus.PAYED, OrderStatus.CANCELED, OrderStatus.PAYMENT_PROCESSING]
              [Math.floor(Math.random() * 3)];
          throw new InvalidOrderStateException(
              data.orderId.toString(),
              invalidStatus,
              OrderStatus.CREATED
          );
        }
      },
      {
        name: 'PaymentRegistrationFailed',
        condition: () => Math.random() < 0.5, // 20% chance
        action: () => {
          // Только те ошибки, которые могут возникнуть при работе с paymentUsecase
          const paymentErrors = [
            'Payment service timeout',
            'Invalid payment token',
            'Payment gateway error'
          ];
          const randomError = paymentErrors[Math.floor(Math.random() * paymentErrors.length)];
          throw new PaymentRegistrationFailedException(randomError);
        }
      }
    ];

    // Проверяем сценарии ошибок
    for (const scenario of realisticErrorScenarios) {
      if (scenario.condition()) {
        this.logger.log(`Simulating realistic error: ${scenario.name}`);
        scenario.action();
        break;
      }
    }
  }
}
