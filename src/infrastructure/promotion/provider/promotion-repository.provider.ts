import { Provider } from '@nestjs/common';
import { IPromotionRepository } from '../../../domain/promotion/promotion-repository.abstract';
import { PromotionRepository } from '../repository/promotion.repository';

export const PromotionRepositoryProvider: Provider = {
  provide: IPromotionRepository,
  useClass: PromotionRepository,
};
