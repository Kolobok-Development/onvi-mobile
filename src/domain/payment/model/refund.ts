export class Refund {
  id?: number;
  orderId?: number;
  sum?: number;
  cardId?: number;
  refundId?: string;
  createdAt?: Date;
  reason?: string;

  constructor(
    id?: number,
    orderId?: number,
    sum?: number,
    cardId?: number,
    refundId?: string,
    createdAt?: Date,
    reason?: string,
  ) {
    this.id = id;
    this.orderId = orderId;
    this.sum = sum;
    this.cardId = cardId;
    this.refundId = refundId;
    this.createdAt = createdAt;
    this.reason = reason;
  }
}