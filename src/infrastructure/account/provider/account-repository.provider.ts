import { Provider } from '@nestjs/common';
import { AccountRespository } from '../repository/account.respository';
import { IAccountRepository } from '../../../domain/account/interface/account-repository.interface';

export const AccountRepositoryProvider: Provider = {
  provide: IAccountRepository,
  useClass: AccountRespository,
};
