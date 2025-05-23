import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClientEntity } from './client.entity';
import { PromoCodeUsageEntity } from '../../promo-code/entity/promo-code-usage.entity';
import { PromotionUsageEntity } from '../../promotion/entity/promotion-usage.entity';

@Entity({ name: 'CRDCARD', synchronize: false })
export class CardEntity {
  @PrimaryGeneratedColumn({ type: 'number', name: 'CARD_ID' })
  cardId: number;

  @Column({ type: 'number', name: 'BALANCE' })
  balance: number;

  @Column({ type: 'number', name: 'IS_LOCKED', nullable: true })
  isLocked: number;

  @Column({ type: 'date', name: 'DATE_BEGIN', nullable: true })
  dateBegin: Date;

  @Column({ type: 'date', name: 'DATE_END', nullable: true })
  dateEnd: Date;

  @ManyToOne(() => ClientEntity, (client: ClientEntity) => client.cards)
  @JoinColumn({ name: 'CLIENT_ID' })
  client: ClientEntity;

  @Column({ type: 'number', name: 'CARD_TYPE_ID' })
  cardTypeId: number;

  @Column({ type: 'varchar2', length: 30, name: 'DEV_NOMER' })
  devNomer: string;

  @Column({ type: 'number', name: 'IS_DEL', nullable: true })
  isDel: number;

  @Column({ type: 'varchar2', length: 1000, name: 'AVTO', nullable: true })
  avto: string;

  @Column({ type: 'number', name: 'MONTH_LIMIT', nullable: true })
  monthLimit: number;

  @Column({ type: 'number', name: 'DISCOUNT', nullable: true })
  discount: number;

  @Column({ type: 'varchar2', length: 100, name: 'GOS_NOMER', nullable: true })
  gosNomer: string;

  @Column({ type: 'number', name: 'CMNCITY_ID', nullable: true })
  cmnCity: number;

  @Column({ type: 'number', name: 'REAL_BALANCE', nullable: true })
  realBalance: number;

  @Column({ type: 'number', name: 'AIR_BALANCE', nullable: true })
  airBalance: number;

  @Column({ type: 'number', name: 'KEY_BALANCE', nullable: true })
  keyBalance: number;

  @Column({ type: 'varchar2', length: 50, name: 'NOMER', nullable: true })
  nomer: string;

  @Column({ type: 'number', name: 'MODEL_ID', nullable: true })
  modelID: number;

  @Column({ type: 'varchar2', length: 4000, name: 'NOTE', nullable: true })
  note: string;

  @Column({ type: 'varchar2', length: 100, name: 'TAG', nullable: true })
  tag: string;

  @Column({ type: 'number', name: 'DAY_LIMIT', nullable: true })
  dayLimit: number;

  @Column({ type: 'number', name: 'MAIN_CARD_ID', nullable: true })
  mainCardId: number;

  @Column({ type: 'number', name: 'DAY_FREE_LIMIT', nullable: true })
  vacuumFreeLimit: number;

  @OneToMany(() => PromoCodeUsageEntity, (usage) => usage.card)
  promoUsages: PromoCodeUsageEntity[];

  @OneToMany(() => PromotionUsageEntity, (usage) => usage.card)
  promotionUsages: PromotionUsageEntity[];
}
