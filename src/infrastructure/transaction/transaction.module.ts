import { Module } from '@nestjs/common';
import { TransactionRepositoryProvider } from './provider/transaction-repository.provider';

@Module({
  imports: [],
  providers: [TransactionRepositoryProvider],
  exports: [TransactionRepositoryProvider],
})
export class TransactionModule {}
