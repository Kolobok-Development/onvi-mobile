import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentGatewayProvider } from './provider/payment-gateway.provider';
import { PaymentRepository } from './repository/payment.repository';
import { EnvConfigModule } from '../config/env-config/env-config.module';
import { PaymentController } from '../../api/payment/payment.controller';
import { PaymentUsecase } from '../../application/usecases/payment/payment.usecase';
import { PaymentRepositoryProvider } from './provider/payment.provider';
import { RefundRepository } from './repository/refund-payment.repository';
import { RefundRepositoryProvider } from './provider/refund-payment.provider';
import { RefundEntity } from './entity/refund.entity';

@Module({
  imports: [
    EnvConfigModule,
    TypeOrmModule.forFeature([RefundEntity]),
  ],
  providers: [
    PaymentGatewayProvider,
    PaymentRepository,
    PaymentUsecase,
    PaymentRepositoryProvider,
    RefundRepository,
    RefundRepositoryProvider,
  ],
  controllers: [PaymentController],
  exports: [
    PaymentUsecase,
    RefundRepositoryProvider,
  ],
})
export class PaymentModule {}
