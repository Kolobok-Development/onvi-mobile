import { Module } from '@nestjs/common';
import { OrderRepositoryProvider } from './provider/order-repository.provider';

@Module({
  imports: [],
  controllers: [],
  providers: [OrderRepositoryProvider],
  exports: [],
})
export class OrderModule {}
