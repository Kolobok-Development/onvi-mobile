import { Provider } from '@nestjs/common';
import { IMetaRepositoryAbstract } from '../../../domain/account/client/meta-repository.abstract';
import { MetaRepository } from '../repository/meta.repository';

export const MetaRepositoryProvider: Provider = {
  provide: IMetaRepositoryAbstract,
  useClass: MetaRepository,
};
