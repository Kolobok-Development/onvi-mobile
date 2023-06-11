import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PromoCodeEntity } from './promocode.entity';
import { CardEntity } from '../../account/entity/card.entity';

@Entity({ name: 'MOBILE_PROMO_CODE_USAGE', synchronize: false })
export class PromoCodeUsageEntity {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id: number;

  @ManyToOne(() => PromoCodeEntity, (promoCode) => promoCode.usages, {
    nullable: false,
  })
  @JoinColumn({ name: 'PROMO_CODE_ID', referencedColumnName: 'id' })
  promoCode: PromoCodeEntity;

  @Column({ name: 'CARWASH_ID', nullable: false })
  carWash: number;

  @ManyToOne(() => CardEntity, (card) => card.promoUsages, { nullable: false })
  @JoinColumn({ name: 'CARD_ID', referencedColumnName: 'cardId' })
  card: CardEntity;

  @Column({ name: 'USAGE_DATE', nullable: false })
  usageDate: Date;
}
