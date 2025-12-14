import { Provider } from '@nestjs/common';
import { ITariffRepository } from '../../../domain/account/card/tariff-repository.abstract';
import { TariffRepository } from '../repository/tariff.repository';

export const TariffRepositoryProvider: Provider = {
  provide: ITariffRepository,
  useClass: TariffRepository,
};
