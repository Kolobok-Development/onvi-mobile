import { PromoCode } from './model/promo-code.model';
import { Card } from '../account/card/model/card';
import { PromoCodeLocation } from './model/promo-code-location';

export abstract class IPromoCodeRepository {
  abstract apply(
    promoCode: PromoCode,
    card: Card,
    carWashId: number,
    usage: number,
  ): Promise<any>;
  abstract findOneByCode(code: string): Promise<PromoCode>;
  abstract validateUsageByCard(cardId: number, id: number): Promise<boolean>;
  abstract findOneById(id: number): Promise<PromoCode>;
  abstract findMaxUsageByCard(cardId: number, id: number): Promise<any>;
}
