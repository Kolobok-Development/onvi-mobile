import { Provider } from '@nestjs/common';
import { IClientRepository } from '../../../domain/account/client/client-repository.abstract';
import { ClientRepository } from '../repository/client.repository';

export const ClientRepositoryProvider: Provider = {
  provide: IClientRepository,
  useClass: ClientRepository,
};
