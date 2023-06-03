import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'ONVI_ORDERS', synchronize: false })
export class OrderEntity {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id: number;

  @Column({ type: 'date', name: 'createdAt' })
  createdAt: Date;

  @Column({ nullable: true, name: 'transactionId' })
  transactionId: string;

  @Column({ name: 'cardId' })
  cardId: number;

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
}
