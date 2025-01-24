import { Provider } from '@nestjs/common';
import { ITransactionRepository } from '../../../domain/transaction/transaction-repository.abstract';
import { TransactionRepository } from '../repository/transaction.repository';

export const TransactionRepositoryProvider: Provider = {
  provide: ITransactionRepository,
  useClass: TransactionRepository,
};
