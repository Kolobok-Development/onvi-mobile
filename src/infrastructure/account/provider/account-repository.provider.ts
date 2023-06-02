import { Provider } from '@nestjs/common';
import { AccountRepository } from '../repository/account-repository.service';
import { IAccountRepository } from '../../../domain/account/interface/account-repository.interface';

export const AccountRepositoryProvider: Provider = {
  provide: IAccountRepository,
  useClass: AccountRepository,
};
