import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { BalanceGateway } from '../../websockets/balance/balance.gateway';
import { EnvConfigService } from '../../infrastructure/config/env-config/env-config.service';
import { BalanceUpdateWebhookDto } from './dto/balance-update-webhook.dto';

@Controller('balance')
export class BalanceWebhookController {
  constructor(
    @Inject(Logger) private readonly logger: Logger,
    private readonly balanceGateway: BalanceGateway,
    private readonly configService: EnvConfigService,
  ) {}

  @Post('/webhook')
  @HttpCode(HttpStatus.OK)
  async handleBalanceUpdate(
    @Body() updateDto: BalanceUpdateWebhookDto,
  ): Promise<{ success: boolean }> {
    this.logger.log(
      `Received balance update webhook for card: ${updateDto.cardNumber}`,
    );

    // Validate webhook secret
    const expectedSecret = this.configService.getWebhookSecret();
    if (updateDto.webhookSecret !== expectedSecret) {
      this.logger.error('Invalid webhook secret provided');
      throw new UnauthorizedException('Invalid webhook secret');
    }

    try {
      // Broadcast the balance update to connected clients
      await this.balanceGateway.broadcastBalanceUpdate(updateDto.cardNumber);

      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing balance update: ${error.message}`);
      return { success: false };
    }
  }
}
