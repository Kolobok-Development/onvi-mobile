import { PromoCode } from './model/promo-code.model';
import { Card } from '../account/card/model/card';
import { PromoCodeLocation } from './model/promo-code-location';

export abstract class IPromoCodeRepository {
  abstract apply(
    promoCode: PromoCode,
    card: Card,
    carWashId: number,
  ): Promise<any>;
  abstract findOneByCode(code: string): Promise<PromoCode>;
  abstract validateUsageByCard(cardId: number): Promise<boolean>;
  abstract findOneById(id: number): Promise<PromoCode>;
}
