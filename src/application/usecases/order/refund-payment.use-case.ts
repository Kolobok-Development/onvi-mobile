import { Inject, Injectable } from '@nestjs/common';
import { IOrderRepository } from '../../../domain/order/order-repository.abstract';
import { PaymentUsecase } from '../payment/payment.usecase';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import {
  InvalidOrderStateException,
  OrderNotFoundException,
} from '../../../domain/order/exceptions/order-base.exceptions';
import { OrderStatus } from '../../../domain/order/enum/order-status.enum';
import { RefundFailedException } from '../../../domain/payment/exceptions/payment-base.exceptions';
import { Logger } from 'nestjs-pino';
import { IRefundPaymentRepository } from 'src/domain/payment/refund-payment-repository.abstract';

@Injectable()
export class RefundPaymentUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly paymentUsecase: PaymentUsecase,
    private readonly refundPaymentRepository: IRefundPaymentRepository,
    @Inject(Logger) private readonly logger: Logger,
  ) {}

  async execute(data: RefundPaymentDto): Promise<any> {
    const order = await this.orderRepository.findOneById(data.orderId);

    if (!order) {
      throw new OrderNotFoundException(data.orderId.toString());
    }

    if (order.orderStatus !== OrderStatus.PAYED) {
      throw new InvalidOrderStateException(
        order.id.toString(),
        order.orderStatus,
        OrderStatus.PAYED
      );
    }

    if (!order.transactionId) {
      throw new Error(`Order ${order.id} does not have transactionId`);
    }

    try {
      const refundResult = await this.paymentUsecase.refund(
        order.transactionId,
        order.sum,
        data.reason
      );

      const refundRecordId = await this.refundPaymentRepository.createRefund({
        orderId: order.id,
        sum: order.sum,
        cardId: order.card.cardId,
        refundId: refundResult.id,
        reason: data.reason
      });

      this.logger.log(
        {
          orderId: order.id,
          refundId: refundResult.id,
          refundRecordId: refundRecordId,
          amount: order.sum,
          reason: data.reason,
        },
        `Refund successful for order ${order.id}. Refund record ID: ${refundRecordId}`
      );

      return {
        success: true,
        refundId: refundResult.id,
        refundRecordId: refundRecordId,
        amount: order.sum,
        status: OrderStatus.REFUNDED,
      };
    } catch (error: any) {
      this.logger.error(
        {
          orderId: order.id,
          errorMessage: error?.message,
          errorStack: error?.stack,
          errorResponse: error?.response?.data,
          reason: data.reason,
          transactionId: order.transactionId,
          orderSum: order.sum
        },
        `Refund failed for order ${order.id}`
      );

      let errorMessage = 'Unknown refund error';
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data) {
        errorMessage = JSON.stringify(error.response.data);
      }

      throw new RefundFailedException(errorMessage);
    }
  }
}