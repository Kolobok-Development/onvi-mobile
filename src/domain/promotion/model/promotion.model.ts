import { PromotionEntity } from '../../../infrastructure/promotion/entity/promotion.entity';

export class Promotion {
  promotionId?: number;
  type: number;
  code: string;
  point: number;
  cashbackType: number;
  expiryDate: Date;
  isActive: number;
  periodUse: number;
  createdAt: Date;
  updatedAt?: Date;
  createdBy: number;
  title: string;
  description: string;

  private constructor(
    type: number,
    code: string,
    point: number,
    cashbackType: number,
    expiryDate: Date,
    isActive: number,
    periodUse: number,
    createdAt: Date,
    createdBy: number,
    title: string,
    description: string,
    {
      promotionId,
      updatedAt,
    }: {
      promotionId?: number;
      updatedAt?: Date;
    },
  ) {
    this.type = type;
    this.code = code;
    this.point = point;
    this.cashbackType = cashbackType;
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
      entity.expiryDate,
      entity.isActive,
      entity.periodUse,
      entity.createdAt,
      entity.createdBy,
      entity.title,
      entity.description,
      {
        promotionId: entity.promotionId,
        updatedAt: entity.updatedAt,
      },
    );

    return promotion;
  }
}
