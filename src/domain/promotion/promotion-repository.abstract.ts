import { Promotion } from './model/promotion.model';
import { Card } from '../account/card/model/card';

export abstract class IPromotionRepository {
  abstract apply(
    promotion: Promotion,
    card: Card,
    expiryPeriodDate: Date,
    isActive: number,
  ): Promise<any>;
  abstract findOneByCode(code: string): Promise<Promotion>;
  abstract validateUsageByCard(
    cardId: number,
    promotionId: number,
  ): Promise<boolean>;
  abstract findOneById(promotionId: number): Promise<Promotion>;
  abstract findActive(cardId: number): Promise<Promotion[]>;
}
