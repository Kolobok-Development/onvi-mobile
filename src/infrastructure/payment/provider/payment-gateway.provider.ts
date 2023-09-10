import { Provider } from '@nestjs/common';
import { YooCheckout } from '@a2seven/yoo-checkout';
import { EnvConfigService } from '../../config/env-config/env-config.service';
import { EnvConfigModule } from '../../config/env-config/env-config.module';

export const PaymentToken = 'PAYMENT_GATEWAY';

export const PaymentGatewayProvider: Provider = {
  provide: PaymentToken,
  useFactory: (env: EnvConfigService) => {
    const shopId = '168905';
    const secretKey = env.getPaymentGatewayApiKey();

    // Initialize YooKassa instance here
    const checkout = new YooCheckout({
      shopId,
      secretKey,
    });

    return checkout;
  },
  inject: [EnvConfigService],
};
