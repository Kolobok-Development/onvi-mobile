import { Refund } from "src/domain/payment/model/refund";
import { RefundEntity } from "../entity/refund.entity";

export class RefundMapper {
  static fromEntity(entity: RefundEntity): Refund {
    const {
      id,
      orderId,
      sum,
      cardId,
      refundId,
      createdAt,
      reason
    } = entity;

    return new Refund(
      id,
      orderId,
      sum,
      cardId,
      refundId,
      createdAt,
      reason
    );
  }
  
  static toRefundEntity(refund: Refund): RefundEntity {
    const refundEntity = new RefundEntity();

    refundEntity.id = refund.id;
    refundEntity.orderId = refund.orderId;
    refundEntity.sum = refund.sum;
    refundEntity.cardId = refund.cardId;
    refundEntity.refundId = refund.refundId;
    refundEntity.createdAt = refund.createdAt;
    refundEntity.reason = refund.reason;

    return refundEntity;
  }
}