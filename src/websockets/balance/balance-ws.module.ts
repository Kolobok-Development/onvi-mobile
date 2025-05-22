import { Module } from '@nestjs/common';
import { BalanceGateway } from './balance.gateway';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { AccountModule } from '../../infrastructure/account/account.module';
import { BalanceWebhookController } from '../../api/webhooks/balance-webhook.controller';
import { EnvConfigModule } from '../../infrastructure/config/env-config/env-config.module';

@Module({
  imports: [AuthModule, AccountModule, EnvConfigModule],
  controllers: [BalanceWebhookController],
  providers: [BalanceGateway],
  exports: [BalanceGateway],
})
export class BalanceWsModule {}
