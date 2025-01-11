import { Provider } from '@nestjs/common';
import { TransactionService } from '../transaction.service';

export const TransactionProvider: Provider = {
  provide: 'ITransactionService',
  useClass: TransactionService,
};
