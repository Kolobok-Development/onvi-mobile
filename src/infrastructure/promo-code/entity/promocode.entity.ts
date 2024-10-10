import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PromoCodeLocationEntity } from './promo-code-location.entity';
import { PromoCodeUsageEntity } from './promo-code-usage.entity';
import {PromoCodeToUserEntity} from "./promo-code-to-user.entity";

@Entity({ name: 'MOBILE_PROMO_CODE', synchronize: false })
export class PromoCodeEntity {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id: number;

  @Column({ type: 'varchar2', length: 100, name: 'CODE' })
  code: string;

  @Column({ type: 'number', name: 'DISCOUNT' })
  discount: number;

  @Column({ name: 'DISCOUNT_TYPE', type: 'number' })
  discountType: number;

  @Column({ name: 'EXPIRY_DATE', type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ name: 'IS_ACTIVE', type: 'number' })
  isActive: number;

  @Column({ name: 'CREATED_AT', type: 'date' })
  createdAt: Date;

  @Column({ name: 'UPDATED_AT', type: 'date' })
  updatedAt: Date;

  @Column({ name: 'CREATED_BY' })
  createdBy: number;

  @Column({ name: 'USAGE_AMOUNT', type: 'number' })
  usageAmount: number;

  @Column({ name: 'IMAGE', type: 'varchar2', length: 255 })
  image: string;

  @OneToMany(() => PromoCodeLocationEntity, (location) => location.promoCode)
  locations: PromoCodeLocationEntity[];

  @OneToMany(() => PromoCodeUsageEntity, (usage) => usage.promoCode)
  usages: PromoCodeUsageEntity[];

  @OneToMany(()=> PromoCodeToUserEntity, (user) => user.promoCode)
  user: PromoCodeToUserEntity[];
}
