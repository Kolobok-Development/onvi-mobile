import { Provider } from '@nestjs/common';
import { IPromotionHistoryRepository } from '../../../domain/promotion/promotionHistory-repository.abstract';
import { PromotionHistoryRepository } from '../repository/promotionHistory.repository';

export const PromotionHistoryRepositoryProvider: Provider = {
  provide: IPromotionHistoryRepository,
  useClass: PromotionHistoryRepository,
};
