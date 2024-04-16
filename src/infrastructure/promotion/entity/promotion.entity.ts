import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PromotionUsageEntity } from './promotion-usage.entity';

@Entity({ name: 'MOBILE_PROMOTION', synchronize: false })
export class PromotionEntity {
  @PrimaryGeneratedColumn({ name: 'PROMOTION_ID' })
  promotionId: number;

  @Column({ name: 'TYPE', type: 'number' })
  type: number;

  @Column({ name: 'IMAGE', type: 'varchar2', length: 255 })
  image: string;

  @Column({ name: 'CODE', type: 'varchar2', length: 20 })
  code: string;

  @Column({ name: 'POINT', type: 'number' })
  point: number;

  @Column({ name: 'CASHBACK_TYPE', type: 'number' })
  cashbackType: number;

  @Column({ name: 'CASHBACK_SUM', type: 'number' })
  cashbackSum: number;

  @Column({ name: 'EXPIRY_DATE', type: 'date' })
  expiryDate: Date;

  @Column({ name: 'IS_ACTIVE', type: 'number' })
  isActive: number;

  @Column({ name: 'PERIOD_USE', type: 'number' })
  periodUse: number;

  @Column({ name: 'CREATED_AT', type: 'date' })
  createdAt: Date;

  @Column({ name: 'UPDATED_AT', type: 'date' })
  updatedAt: Date;

  @Column({ name: 'CREATED_BY' })
  createdBy: number;

  @Column({ name: 'TITLE', type: 'varchar2', length: 255 })
  title: string;

  @Column({ name: 'DESCRIPTION', type: 'varchar2', length: 255 })
  description: string;

  @OneToMany(() => PromotionUsageEntity, (usage) => usage.promotion)
  usages: PromotionUsageEntity[];
}
