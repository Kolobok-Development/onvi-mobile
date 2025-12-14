import { Provider } from '@nestjs/common';
import { ICardHistoryRepository } from '../../../domain/account/card/cardHistory-repository.abstract';
import { CardHistoryRepository } from '../repository/cardHistory.repository';

export const CardHistoryRepositoryProvider: Provider = {
  provide: ICardHistoryRepository,
  useClass: CardHistoryRepository,
};
