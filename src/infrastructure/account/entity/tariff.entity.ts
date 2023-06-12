import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity({ name: 'CRDCARD_TYPE', synchronize: false })
export class TariffEntity {
  @PrimaryGeneratedColumn({ name: 'CARD_TYPE_ID' })
  cardTypeId: number;
  @Column({ name: 'NAME', type: 'nvarchar2', length: 200 })
  name: string;
  @Column({ name: 'CODE', type: 'nvarchar2', length: 50, nullable: true })
  code: string;
  @Column({ name: 'BONUS', type: 'number', nullable: true })
  bonus: number;
  @Exclude()
  @Column({ name: 'DISCOUNT', type: 'number', nullable: true })
  discount: number;
  @Exclude()
  @Column({ name: 'IS_BONUS', type: 'number', default: 1 })
  isBonus: number;
  @Exclude()
  @Column({ name: 'IS_DISCOUNT', type: 'number', nullable: true })
  isDiscount: number;
  @Column({ name: 'CREATE_DATE' })
  createDate: Date;
  @Exclude()
  @Column({ name: 'UPDATE_DATE' })
  updateDate: Date;
  @Exclude()
  @Column({ name: 'CREATE_USER_ID', nullable: true })
  createUserId: number;
  @Exclude()
  @Column({ name: 'UPDATE_USER_ID', nullable: true })
  updateUserId: number;
  @Exclude()
  @Column({ name: 'IS_UP', type: 'number', nullable: true })
  isUp: number;
  @Exclude()
  @Column({ name: 'IS_DOWN', type: 'number', nullable: true })
  isDown: number;
  @Exclude()
  @Column({ name: 'TRANSFER_PERIOD', nullable: true })
  transferPeriod: number;
  @Exclude()
  @Column({ name: 'TRANSFER_DATE', nullable: true })
  transferDate: Date;
  @Exclude()
  @Column({ name: 'UP_MONEY', nullable: true })
  upMoney: number;
  @Exclude()
  @Column({ name: 'DOWN_MONEY', nullable: true })
  downMoney: number;
  @Exclude()
  @Column({ name: 'UP_TYPE_ID', nullable: true })
  upType: number;
  @Exclude()
  @Column({ name: 'DOWN_TYPE_ID', nullable: true })
  downType: number;
  @Exclude()
  @Column({ name: 'IS_CASH', type: 'number', nullable: true })
  isCash: number;
  @Exclude()
  @Column({ name: 'GROUP_ID' })
  groupId: number;
  @Exclude()
  @Column({ name: 'IS_BIRTHDAY_BONUS', type: 'number', nullable: true })
  isBirthdayBonus: number;
  @Exclude()
  @Column({ name: 'BIRTHDAY_BONUS', nullable: true })
  birthdayBonus: number;
  @Exclude()
  @Column({ name: 'BONUS_ACQ', nullable: true })
  bonusAcq: number;
  @Exclude()
  @Column({ name: 'IS_BONUS_ACQ', type: 'number', nullable: true })
  isBonusAcq: number;
  @Exclude()
  @Column({ name: 'BONUS_ACTIVATE', nullable: true })
  bonusActivate: number;
  @Exclude()
  @Column({ name: 'IS_BONUS_ACTIVATE', type: 'number', nullable: true })
  isBonusActivate: number;
  @Exclude()
  @Column({ name: 'PERIOD_FREEZE', type: 'number', nullable: true })
  periodFreeze: number;
  @Exclude()
  @Column({ name: 'AMOUNT_FREEZE_YEAR', type: 'number', nullable: true })
  amountFreezeYear: number;
  @Exclude()
  @Column({ name: 'FREEZE_PRICE', nullable: true })
  freezePrice: number;
  @Column({ name: 'COUNTRY_CODE', type: 'number', nullable: true })
  countryCode: number;
}
