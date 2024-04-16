import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PromoCodeEntity } from './promocode.entity';

@Entity({ name: 'MOBILE_PROMO_CODE_LOCATION', synchronize: false })
export class PromoCodeLocationEntity {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id: number;

  @ManyToOne(() => PromoCodeEntity, (promoCode) => promoCode.locations)
  @JoinColumn({ name: 'PROMO_CODE_ID', referencedColumnName: 'id' })
  promoCode: PromoCodeEntity;

  @Column({ name: 'CARWASH_ID' })
  carwashId: number;
}
