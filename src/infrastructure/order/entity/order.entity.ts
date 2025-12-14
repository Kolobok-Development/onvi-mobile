import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DeviceType } from '../../../domain/order/enum/device-type.enum';
import { CardEntity } from '../../account/entity/card.entity';

@Entity({ name: 'ONVI_ORDERS', synchronize: false })
export class OrderEntity {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id: number;

  @Column({ type: 'timestamp', name: 'createdAt' })
  createdAt: Date;

  @Column({ nullable: true, name: 'transactionId' })
  transactionId: string;

  @Column({ name: 'cardId' })
  cardId: number;

  @ManyToOne(() => CardEntity, { eager: true })
  @JoinColumn({ name: 'cardId' })
  card: CardEntity;

  @Column({ name: 'SUM' })
  sum: number;

  @Column({ nullable: true, name: 'promoCodeId' })
  promoCodeId: number;

  @Column({ nullable: true, name: 'discountAmount' })
  discountAmount: number;

  @Column({ name: 'orderStatus' })
  orderStatus: string;

  @Column({ nullable: true, name: 'rewardPointsUsed' })
  rewardPointsUsed: number;

  @Column({ name: 'carWashId' })
  carWashId: number;

  @Column({ name: 'bayNumber' })
  bayNumber: number;

  @Column({ nullable: true, name: 'excecutionError' })
  excecutionError: string;

  @Column({ name: 'CASHBACK_AMOUNT' })
  cashback: number;

  @Column({ name: 'bayType' })
  bayType: DeviceType;
}
