import { PromotionHistEntity } from '../../../infrastructure/promotion/entity/promotion-hist.entity';

export class PromotionHist {
  cardId: number;
  promotionId: number;
  title: string;
  description: string;
  code: string;
  type: number;
  point: number;
  cashbackType: number;
  promotionUsageId: number;
  expiryPeriodDate: Date;
  usageDate: Date;

  constructor(
    cardId: number,
    promotionId: number,
    title: string,
    description: string,
    code: string,
    type: number,
    point: number,
    cashbackType: number,
    promotionUsageId: number,
    expiryPeriodDate: Date,
    usageDate: Date,
  ) {
    this.cardId = cardId;
    this.promotionId = promotionId;
    this.title = title;
    this.description = description;
    this.code = code;
    this.type = type;
    this.point = point;
    this.cashbackType = cashbackType;
    this.promotionUsageId = promotionUsageId;
    this.expiryPeriodDate = expiryPeriodDate;
    this.usageDate = usageDate;
  }

  public static fromEntity(
    promotionHistEntity: PromotionHistEntity,
  ): PromotionHist {
    const {
      cardId,
      promotionId,
      title,
      description,
      code,
      type,
      point,
      cashbackType,
      promotionUsageId,
      expiryPeriodDate,
      usageDate,
    } = promotionHistEntity;

    return new PromotionHist(
      cardId,
      promotionId,
      title,
      description,
      code,
      type,
      point,
      cashbackType,
      promotionUsageId,
      expiryPeriodDate,
      usageDate,
    );
  }
}
