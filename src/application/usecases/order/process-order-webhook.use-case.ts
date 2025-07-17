import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { IOrderRepository } from '../../../domain/order/order-repository.abstract';
import {
  CardForOrderNotFoundException, OrderNotFoundByTransactionIdException,
  OrderNotFoundException, RewardPointsWithdrawalException
} from '../../../domain/order/exceptions/order-base.exceptions';
import { OrderStatus } from '../../../domain/order/enum/order-status.enum';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { PaymentStatusGatewayWebhookDto } from '../../../api/webhooks/dto/payment-gateway-webhook.dto';
import {ITransactionRepository} from "../../../domain/transaction/transaction-repository.abstract";
import {IPosService} from "../../../infrastructure/pos/interface/pos.interface";

@Injectable()
export class ProcessOrderWebhookUseCase {
  constructor(
    @Inject(Logger) private readonly logger: Logger,
    private readonly orderRepository: IOrderRepository,
    @InjectQueue('pos-process') private readonly dataQueue: Queue,
    private readonly transactionRepository: ITransactionRepository,
    private readonly posService: IPosService,
  ) {}

  async execute(data: PaymentStatusGatewayWebhookDto): Promise<any> {
    const order = await this.orderRepository.findByTransactionId(
      data.object.id,
    );

    if (!order) throw new OrderNotFoundByTransactionIdException(data.object.id.toString());

    this.logger.log(
      {
        orderId: order.id,
        action: `webhook_received_${data.event}`,
        timestamp: new Date(),
        details: JSON.stringify(data),
      },
      `Received payment confirmation ${data.object.id}`,
    );

    if (data.event === 'payment.canceled') {
      const updatedOrder = {
        ...order,
        orderStatus: OrderStatus.CANCELED,
      };

      await this.orderRepository.update(updatedOrder);

      return;
    }

    const updatedOrder = {
      ...order,
      orderStatus: OrderStatus.PAYED,
    };

    await this.orderRepository.update(updatedOrder);

    if (updatedOrder.rewardPointsUsed > 0) {
      const bayDetails = await this.posService.ping({
        posId: order.carWashId,
        bayNumber: order.bayNumber,
        type: order.bayType,
      });

      const withdraw = await this.transactionRepository.withdraw(
          bayDetails.id,
          order.card.devNomer,
          order.rewardPointsUsed.toString(),
          '1',
      );

      if (!withdraw) {
        throw new RewardPointsWithdrawalException();
      }
    }

    //add to the task
    await this.dataQueue.add('pos-process', {
      orderId: order.id,
    });
  }
}
