import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { PaymentStatusGatewayWebhookDto } from './dto/payment-gateway-webhook.dto';
import { ProcessOrderWebhookUseCase } from '../../application/usecases/order/process-order-webhook.use-case';
import { OrderNotFoundException } from '../../domain/order/exceptions/order-base.exceptions';
import { CustomHttpException } from '../../infrastructure/common/exceptions/custom-http.exception';
import { ClientException } from '../../infrastructure/common/exceptions/base.exceptions';

@Controller('payment-webhook')
export class PaymentWebhookController {
  constructor(
    private readonly processOrderWebhook: ProcessOrderWebhookUseCase,
  ) {}

  @Post('/webhook')
  @HttpCode(HttpStatus.OK)
  async handlePyamentSatus(
    @Body() webhookData: PaymentStatusGatewayWebhookDto,
  ): Promise<any> {
    try {
      await this.processOrderWebhook.execute(webhookData);
    } catch (e) {
      if (e instanceof OrderNotFoundException) {
        throw new CustomHttpException({
          type: e.type,
          innerCode: e.innerCode,
          message: e.message,
          code: HttpStatus.NOT_FOUND,
        });
      } else if (e instanceof ClientException) {
        throw new CustomHttpException({
          type: e.type,
          innerCode: e.innerCode,
          message: e.message,
          code: HttpStatus.UNPROCESSABLE_ENTITY,
        });
      } else {
        throw new CustomHttpException({
          message: e.message,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
        });
      }
    }
  }
}
