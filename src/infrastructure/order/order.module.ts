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
import { OrderUsecase } from '../../application/usecases/order/order.usecase';
import {PartnerModule} from "../partner/partner.module";

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
    PartnerModule
  ],
  controllers: [OrderController],
  providers: [
    OrderRepositoryProvider,
    CreateOrderUseCase,
    OrderUsecase, // Ensure CreateOrderUseCase is registered
  ],
  exports: [OrderRepositoryProvider],
})
export class OrderModule {}
