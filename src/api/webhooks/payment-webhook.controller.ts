import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { PaymentStatusGatewayWebhookDto } from './dto/payment-gateway-webhook.dto';

@Controller('payment-webhook')
export class PaymentWebhookController {
  constructor() {}

  @Post('/webhook')
  @HttpCode(HttpStatus.OK)
  async handlePyamentSatus(@Body() webhookData: PaymentStatusGatewayWebhookDto): Promise<any> {
    console.log(webhookData);
  }
}
