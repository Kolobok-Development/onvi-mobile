import { Provider } from '@nestjs/common';
import { IPromoCodeRepository } from '../../../domain/promo-code/promo-code-repository.abstract';
import { PromoCodeRepository } from '../repository/promo-code.repository';

export const PromoCodeRepositoryProvider: Provider = {
  provide: IPromoCodeRepository,
  useClass: PromoCodeRepository,
};
