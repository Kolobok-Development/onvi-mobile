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
  ],
  controllers: [OrderController],
  providers: [
    OrderRepositoryProvider,
    CreateOrderUseCase,
    ValidateOrderPromocodeUsecase,
    RegisterPaymentUseCase,
    StartPosUseCase,
    GetOrderByIdUseCase,
  ],
  exports: [OrderRepositoryProvider],
})
export class OrderModule {}
