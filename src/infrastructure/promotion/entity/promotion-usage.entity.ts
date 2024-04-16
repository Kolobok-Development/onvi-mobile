import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PromotionEntity } from './promotion.entity';
import { CardEntity } from '../../account/entity/card.entity';

@Entity({ name: 'MOBILE_PROMOTION_USAGE', synchronize: false })
export class PromotionUsageEntity {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id: number;

  @ManyToOne(() => PromotionEntity, (promotion) => promotion.usages, {
    nullable: false,
  })
  @JoinColumn({ name: 'PROMOTION_ID', referencedColumnName: 'promotionId' })
  promotion: PromotionEntity;

  @ManyToOne(() => CardEntity, (card) => card.promotionUsages, {
    nullable: false,
  })
  @JoinColumn({ name: 'CARD_ID', referencedColumnName: 'cardId' })
  card: CardEntity;

  @Column({ name: 'EXPIRY_PERIOD_DATE', type: 'date' })
  expiryPeriodDate: Date;

  @Column({ name: 'USAGE_DATE', nullable: false })
  usageDate: Date;

  @Column({ name: 'IS_ACTIVE', type: 'number' })
  isActive: number;
}
