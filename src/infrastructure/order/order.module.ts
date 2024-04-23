import { Module } from '@nestjs/common';
import { OrderRepositoryProvider } from './provider/order-repository.provider';
import { HttpModule } from '@nestjs/axios';
import { EnvConfigModule } from '../config/env-config/env-config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from '../../api/order/order.controller';
import { OrderUsecase } from '../../application/usecases/order/order.usecase';
import { OrderEntity } from './entity/order.entity';
import { PromocodeModule } from '../promo-code/promocode.module';
import { PaymentModule } from '../payment/payment.module';
import {AccountModule} from "../account/account.module";

@Module({
  imports: [
    HttpModule,
    EnvConfigModule,
    PromocodeModule,
    TypeOrmModule.forFeature([OrderEntity]),
    PaymentModule,
    AccountModule,
  ],
  controllers: [OrderController],
  providers: [OrderRepositoryProvider, OrderUsecase],
  exports: [OrderRepositoryProvider],
})
export class OrderModule {}
