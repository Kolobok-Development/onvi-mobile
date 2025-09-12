import { Module } from '@nestjs/common';
import { OrderRepositoryProvider } from './provider/order-repository.provider';
import { HttpModule } from '@nestjs/axios';
import { EnvConfigModule } from '../config/env-config/env-config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from '../../api/order/order.controller';
import { OrderEntity } from './entity/order.entity';
import { PromocodeModule } from '../promo-code/promocode.module';
import { PaymentModule } from '../payment/payment.module';
import { AccountModule } from '../account/account.module';
import { TransactionModule } from '../transaction/transaction.module';
import { PosModule } from '../pos/pos.module';
import { CreateOrderUseCase } from '../../application/usecases/order/create-order.use-case';
import { ValidateOrderPromocodeUsecase } from '../../application/usecases/order/validate-order-promocode.usecase';
import { RegisterPaymentUseCase } from '../../application/usecases/order/register-payment.use-case';
import { StartPosUseCase } from '../../application/usecases/order/start-pos.use-case';
import { GetOrderByIdUseCase } from '../../application/usecases/order/get-order-by-id.use-case';
import { GetOrderByTransactionIdUseCase } from '../../application/usecases/order/get-order-by-transaction-id.use-case';
import { UpdateOrderStatusUseCase } from '../../application/usecases/order/update-order-status.use-case';
import { PaymentWebhookController } from '../../api/webhooks/payment-webhook.controller';
import { BullModule } from '@nestjs/bullmq';
import { ProcessOrderWebhookUseCase } from '../../application/usecases/order/process-order-webhook.use-case';
import { StartPosProcess } from '../../application/usecases/order/process/start-pos.process';
import { PartnerModule } from '../partner/partner.module';
import { CarwashUseCase } from 'src/application/usecases/order/carwash.use-case';

@Module({
  imports: [
    HttpModule,
    EnvConfigModule,
    PromocodeModule, // Ensure PromocodeModule is imported
    TypeOrmModule.forFeature([OrderEntity]), // Ensure OrderEntity is correctly registered
    PaymentModule,
    AccountModule,
    TransactionModule,
    PosModule,
    PartnerModule,
    BullModule.registerQueue({
      name: 'pos-process',
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 3,
      },
    }),
  ],
  controllers: [OrderController, PaymentWebhookController],
  providers: [
    OrderRepositoryProvider,
    CreateOrderUseCase,
    ValidateOrderPromocodeUsecase,
    RegisterPaymentUseCase,
    StartPosUseCase,
    GetOrderByIdUseCase,
    GetOrderByTransactionIdUseCase,
    UpdateOrderStatusUseCase,
    ProcessOrderWebhookUseCase,
    StartPosProcess,
    CarwashUseCase,
  ],
  exports: [OrderRepositoryProvider],
})
export class OrderModule {}
