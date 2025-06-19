import { PromotionEntity } from '../../../infrastructure/promotion/entity/promotion.entity';

export class Promotion {
  promotionId?: number;
  type: number;
  image?: string;
  code: string;
  point: number;
  cashbackType: number;
  cashbackSum: number;
  expiryDate: Date;
  isActive: number;
  periodUse: number;
  createdAt: Date;
  updatedAt?: Date;
  createdBy: number;
  title: string;
  description: string;
  totalPoints?: number;

  private constructor(
    type: number,
    code: string,
    point: number,
    cashbackType: number,
    cashbackSum: number,
    expiryDate: Date,
    isActive: number,
    periodUse: number,
    createdAt: Date,
    createdBy: number,
    title: string,
    description: string,
    {
      image,
      promotionId,
      updatedAt,
    }: {
      image?: string;
      promotionId?: number;
      updatedAt?: Date;
    },
  ) {
    this.type = type;
    this.image = image;
    this.code = code;
    this.point = point;
    this.cashbackType = cashbackType;
    this.cashbackSum = cashbackSum;
    this.expiryDate = expiryDate;
    this.isActive = isActive;
    this.periodUse = periodUse;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
    this.promotionId = promotionId;
    this.updatedAt = updatedAt;
    this.title = title;
    this.description = description;
  }

  public static fromEntity(entity: PromotionEntity): Promotion {
    const promotion = new Promotion(
      entity.type,
      entity.code,
      entity.point,
      entity.cashbackType,
      entity.cashbackSum,
      entity.expiryDate,
      entity.isActive,
      entity.periodUse,
      entity.createdAt,
      entity.createdBy,
      entity.title,
      entity.description,
      {
        image: entity.image,
        promotionId: entity.promotionId,
        updatedAt: entity.updatedAt,
      },
    );

    return promotion;
  }
}
