import { Module } from '@nestjs/common';
import { OrderRepositoryProvider } from './provider/order-repository.provider';
import { HttpModule } from '@nestjs/axios';
import { EnvConfigModule } from '../config/env-config/env-config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from '../../api/order/order.controller';
import { OrderUsecase } from '../../application/usecases/order/order.usecase';
import { OrderEntity } from './entity/order.entity';

@Module({
  imports: [
    HttpModule,
    EnvConfigModule,
    TypeOrmModule.forFeature([OrderEntity]),
  ],
  controllers: [OrderController],
  providers: [OrderRepositoryProvider, OrderUsecase],
  exports: [],
})
export class OrderModule {}
