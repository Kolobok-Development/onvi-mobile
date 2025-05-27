import {OrderStatus} from '../enum/order-status.enum';
import {ICreateOrderDto} from '../dto/create-order.dto';
import {Card} from '../../account/card/model/card';
import {OrderEntity} from '../../../infrastructure/order/entity/order.entity';
import {OrderProcessingException} from '../exceptions/order-processing.exception';
import {InsufficientRewardPointsException} from '../exceptions/insufficient-reward-roints.exception';
import {DeviceType} from "../enum/device-type.enum";
import {CardMapper} from "../../../infrastructure/account/mapper/card.mapper";

interface OrderOptions {
  id?: number;
  card?: Card;
  transactionId?: string;
  rewardPointsUsed?: number;
  promoCodeId?: number;
  discountAmount?: number;
  excecutionError?: string;
}
export class Order {
  id?: number;
  card?: Card;
  transactionId?: string;
  createdAt: Date;
  sum: number;
  promoCodeId?: number;
  discountAmount?: number;
  orderStatus: OrderStatus;
  rewardPointsUsed?: number;
  carWashId: number;
  bayNumber: number;
  bayType: DeviceType;
  excecutionError?: string;
  cashback: number;

  private constructor(
    createdAt: Date,
    sum: number,
    orderStatus: OrderStatus,
    carWashId: number,
    bayNumber: number,
    bayType: DeviceType,
    cashback: number,
    {
      id,
      transactionId,
      rewardPointsUsed,
      promoCodeId,
      discountAmount,
      excecutionError,
      card,
    }: OrderOptions,
  ) {
    this.id = id;
    this.card = card;
    this.createdAt = createdAt;
    this.sum = sum;
    this.orderStatus = orderStatus;
    this.carWashId = carWashId;
    this.bayNumber = bayNumber;
    this.bayType = bayType;
    this.excecutionError = excecutionError;
    this.transactionId = transactionId;
    this.promoCodeId = promoCodeId;
    this.rewardPointsUsed = rewardPointsUsed;
    this.discountAmount = discountAmount;
    this.cashback = cashback;
  }

  public static create(data: ICreateOrderDto): Order {
    const {
      card,
      transactionId,
      sum,
      promoCodeId,
      carWashId,
      bayNumber,
      bayType,
      rewardPointsUsed,
      cashback,
    } = data;

    const createdAt: Date = new Date();

    if (rewardPointsUsed > 0) {
      if (card.balance < sum) {
        throw new InsufficientRewardPointsException();
      }

      if (rewardPointsUsed <= 0) {
        throw new OrderProcessingException();
      }
    } else if (card.isLocked === 1) {
      throw new OrderProcessingException();
    } else if (sum < 0) {
      throw new OrderProcessingException();
    }

    const orderStatus: OrderStatus = data.status;

    return new Order(
      createdAt,
      sum,
      orderStatus,
      carWashId,
      bayNumber,
      bayType,
      cashback,
      {
        transactionId,
        promoCodeId,
        rewardPointsUsed,
        card: card,
      },
    );
  }

  public static fromEntity(entity: OrderEntity): Order {
    const statusMappings: Record<string, OrderStatus> = {
      created: OrderStatus.CREATED,
      payment_processing: OrderStatus.PAYMENT_PROCESSING,
      waiting_payment: OrderStatus.WAITING_PAYMENT,
      payment_authorized: OrderStatus.PAYMENT_AUTHORIZED,
      free_processing: OrderStatus.FREE_PROCESSING,
      payed: OrderStatus.PAYED,
      failed: OrderStatus.FAILED,
      completed: OrderStatus.COMPLETED,
      canceled: OrderStatus.CANCELED,
      refunded: OrderStatus.REFUNDED,
    };
    const orderStatus =
      statusMappings[entity.orderStatus] || OrderStatus.CREATED;
    const order = new Order(
      entity.createdAt,
      entity.sum,
      orderStatus,
      entity.carWashId,
      entity.bayNumber,
      entity.bayType,
      entity.cashback,
      {
        id: entity.id,
        transactionId: entity.transactionId,
        rewardPointsUsed: entity.rewardPointsUsed,
        discountAmount: entity.discountAmount,
        excecutionError: entity.excecutionError,
        card: entity.card ? CardMapper.fromEntity(entity.card) : undefined,
      },
    );

    return order;
  }
}
