import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'ONVI_REFUND', synchronize: false })
export class RefundEntity {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id: number;

  @Column({ name: 'ORDER_ID', nullable: false })
  orderId: number;

  @Column({ name: 'SUM', nullable: false })
  sum: number;

  @Column({ name: 'CARD_ID', nullable: false })
  cardId: number;

  @Column({ name: 'REFUND_ID', nullable: false })
  refundId: string;

  @Column({ name: 'CREATED_AT', nullable: false })
  createdAt: Date;

  @Column({ name: 'REASON', nullable: true })
  reason: string;
}
