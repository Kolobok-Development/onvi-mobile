import { PromotionHistEntity } from '../../../infrastructure/promotion/entity/promotion-hist.entity';

export class PromotionHist {
  cardId: number;
  promotionId: number;
  image?: string;
  title: string;
  description: string;
  code: string;
  type: number;
  point: number;
  cashbackType: number;
  cashbackSum: number;
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
    cashbackSum: number,
    promotionUsageId: number,
    expiryPeriodDate: Date,
    usageDate: Date,
    {
      image,
    }: {
      image?: string;
    },
  ) {
    this.cardId = cardId;
    this.promotionId = promotionId;
    this.image = image;
    this.title = title;
    this.description = description;
    this.code = code;
    this.type = type;
    this.point = point;
    this.cashbackType = cashbackType;
    this.cashbackSum = cashbackSum;
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
      image,
      point,
      cashbackType,
      cashbackSum,
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
      cashbackSum,
      promotionUsageId,
      expiryPeriodDate,
      usageDate,
      { image },
    );
  }
}
