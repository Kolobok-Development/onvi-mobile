import { RefundEntity } from "src/infrastructure/payment/entity/refund.entity";

export abstract class IRefundPaymentRepository {
  abstract createRefund(refundData: {
    orderId: number;
    sum: number; 
    cardId: number;
    refundId: string;
    reason: string;
  }): Promise<number>;

  abstract findByOrderId(orderId: number): Promise<RefundEntity[]>;
  
  abstract findByRefundId(refundId: string): Promise<RefundEntity>;

  abstract findByCardId(cardId: number): Promise<RefundEntity[]>;

  abstract getRefundHistory(params: {
    cardId?: number;
    orderId?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<RefundEntity[]>;
}