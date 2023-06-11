import { PromoCodeLocationEntity } from '../../../infrastructure/promo-code/enitity/promo-code-location.entity';

export class PromoCodeLocation {
  id?: number;
  carWashId: number;

  private constructor(carWashId: number, id?: number) {
    this.carWashId = carWashId;
    this.id = id;
  }

  public static fromEntity(entity: PromoCodeLocationEntity): PromoCodeLocation {
    return new PromoCodeLocation(entity.carwashId, entity.id);
  }
}
