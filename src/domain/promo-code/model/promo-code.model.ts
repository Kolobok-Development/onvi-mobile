import { PromoCodeEntity } from '../../../infrastructure/promo-code/entity/promocode.entity';
import { PromoCodeLocation } from './promo-code-location';
import { PromoCodeLocationEntity } from '../../../infrastructure/promo-code/entity/promo-code-location.entity';

export class PromoCode {
  id?: number;
  code: string;
  discount?: number;
  discountType: number;
  expiryDate: Date;
  isActive: number;
  createdAt: Date;
  updatedAt?: Date;
  createdBy: number;
  usageAmount: number;
  locations?: PromoCodeLocation[];

  private constructor(
    code: string,
    discountType: number,
    expiryDate: Date,
    isActive: number,
    createdAt: Date,
    createdBy: number,
    usageAmount: number,
    {
      id,
      discount,
      updatedAt,
      locations,
    }: {
      id?: number;
      discount?: number;
      updatedAt?: Date;
      locations?: PromoCodeLocation[];
    },
  ) {
    this.code = code;
    this.discountType = discountType;
    this.expiryDate = expiryDate;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
    this.id = id;
    this.discount = discount;
    this.updatedAt = updatedAt;
    this.locations = locations;
    this.usageAmount = usageAmount;
  }

  public validate(): boolean {
    return false;
  }


  public static fromEntity(entity: PromoCodeEntity): PromoCode {
    let locations;

    if (entity.locations) {
      locations = entity.locations.map((location: PromoCodeLocationEntity) =>
        PromoCodeLocation.fromEntity(location),
      );
    }
    const promoCode = new PromoCode(
      entity.code,
      entity.discountType,
      entity.expiryDate,
      entity.isActive,
      entity.createdAt,
      entity.createdBy,
      entity.usageAmount,
      {
        id: entity.id,
        discount: entity.discount,
        updatedAt: entity.updatedAt,
        locations,
      },
    );

    return promoCode;
  }
}
