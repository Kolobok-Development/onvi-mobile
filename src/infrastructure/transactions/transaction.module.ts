import { Module } from '@nestjs/common';
import { TransactionProvider } from './provider/transaction.provider';

@Module({
  imports: [],
  providers: [TransactionProvider],
  exports: ['ITransactionService'],
})
export class TransactionModule {}
