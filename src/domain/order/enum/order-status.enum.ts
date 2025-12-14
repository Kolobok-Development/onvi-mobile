export enum OrderStatus {
  CREATED = 'created',
  PAYMENT_PROCESSING = 'payment_processing',
  WAITING_PAYMENT = 'waiting_payment',
  PAYMENT_AUTHORIZED = 'payment_authorized',
  PAYED = 'payed',
  FAILED = 'failed',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
  REFUNDED = 'refunded',
  FREE_PROCESSING = 'free_processing',
}
