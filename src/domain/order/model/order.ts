import { OrderStatus } from '../enum/order-status.enum';
import { PaymentType } from '../enum/payment-type.enum';
import { ICreateOrderDto } from '../dto/create-order.dto';

interface OrderOptions {
  id?: number;
  externalId?: string;
  promoCodeId?: number;
  excecutionError?: string;
  completedAt?: Date;
}
export class Order {
  id?: number;
  cardUnqNumber: string;
  externalId?: string;
  createdAt: Date;
  orderSum: number;
  promoCodeId?: number;
  orderStatus: OrderStatus;
  paymentType: PaymentType;
  carWashId: number;
  bayNumber: number;
  excecutionError?: string;
  completedAt?: Date;

  private constructor(
    cardUnqNumber: string,
    createdAt: Date,
    orderSum: number,
    orderStatus: OrderStatus,
    paymentType: PaymentType,
    carWashId: number,
    bayNumber: number,
    { id, externalId, promoCodeId, excecutionError, completedAt }: OrderOptions,
  ) {
    this.id = id;
    this.cardUnqNumber = cardUnqNumber;
    this.createdAt = createdAt;
    this.orderSum = orderSum;
    this.orderStatus = orderStatus;
    this.paymentType = paymentType;
    this.carWashId = carWashId;
    this.bayNumber = bayNumber;
    this.excecutionError = excecutionError;
    this.completedAt = completedAt;
    this.externalId = externalId;
    this.promoCodeId = promoCodeId;
  }

  public static create(data: ICreateOrderDto): Order {
    const {
      card,
      externalId,
      orderSum,
      promoCodeId,
      paymentType,
      carWashId,
      bayNumber,
    } = data;

    const createdAt: Date = new Date(Date.now());
    const orderStatus: OrderStatus = OrderStatus.CREATED;

    if (paymentType === PaymentType.POINTS && card.balance < orderSum) {
      throw new Error('Balance too low');
    } else if (card.isLocked === 1) {
      throw new Error('Card is locked');
    } else if (paymentType === PaymentType.BANKCARD && !externalId) {
      throw new Error('Unable to process payment');
    } else if (orderSum < 0) {
      throw new Error('Negative sum error');
    }

    return new Order(
      card.devNomer,
      createdAt,
      orderSum,
      orderStatus,
      paymentType,
      carWashId,
      bayNumber,
      {
        externalId,
        promoCodeId,
      },
    );
  }
}
