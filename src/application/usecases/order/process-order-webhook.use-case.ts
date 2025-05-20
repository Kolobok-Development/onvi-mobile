import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { IOrderRepository } from '../../../domain/order/order-repository.abstract';
import { PaymentStatusGatewayWebhookDto } from '../../../api/webhooks/dto/payment-gateway-webhook.dto';
import { OrderNotFoundException } from '../../../domain/order/exceptions/order-base.exceptions';
import { OrderStatus } from '../../../domain/order/enum/order-status.enum';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class ProcessOrderWebhookUseCase {
  constructor(
    @Inject(Logger) private readonly logger: Logger,
    private readonly orderRepository: IOrderRepository,
    @InjectQueue('pos-process') private readonly dataQueue: Queue,
  ) {}

  async execute(data: PaymentStatusGatewayWebhookDto): Promise<any> {
    const order = await this.orderRepository.findByTransactionId(data.id);

    if (!order) throw new OrderNotFoundException(order.id.toString());

    this.logger.log(
      {
        orderId: order.id,
        action: `webhook_received_${data.event}`,
        timestamp: new Date(),
        details: JSON.stringify(data),
      },
      `Received payment confirmation ${data.id}`,
    );

    const updatedOrder = {
      ...order,
      orderStatus: OrderStatus.PAYED,
    };

    await this.orderRepository.update(updatedOrder);

    //add to the task
    await this.dataQueue.add('pos-process', {
      orderId: order.id,
    });
  }
}
