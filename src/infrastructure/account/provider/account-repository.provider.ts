import { Provider } from '@nestjs/common';
import { AccountRespository } from '../repository/account.respository';

export const AccountRepositoryProvider: Provider = {
  provide: 'AccountRepository',
  useClass: AccountRespository,
};
