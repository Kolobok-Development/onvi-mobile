import { Module } from '@nestjs/common';
import { PaymentGatewayProvider } from './provider/payment-gateway.provider';
import { PaymentRepository } from './repository/payment.repository';
import { EnvConfigModule } from '../config/env-config/env-config.module';
import { PaymentController } from '../../api/payment/payment.controller';
import { PaymentUsecase } from '../../application/usecases/payment/payment.usecase';
import { PaymentRepositoryProvider } from './provider/payment.provider';

@Module({
  imports: [EnvConfigModule],
  providers: [
    PaymentGatewayProvider,
    PaymentRepository,
    PaymentUsecase,
    PaymentRepositoryProvider,
  ],
  controllers: [PaymentController],
  exports: [PaymentUsecase],
})
export class PaymentModule {}
