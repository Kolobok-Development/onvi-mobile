import { OrderStatus } from '../enum/order-status.enum';
import { ICreateOrderDto } from '../dto/create-order.dto';
import { Card } from '../../account/card/model/card';
import { OrderEntity } from '../../../infrastructure/order/entity/order.entity';
import {OrderProcessingException} from "../exceptions/order-processing.exception";

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
  excecutionError?: string;

  private constructor(
    createdAt: Date,
    sum: number,
    orderStatus: OrderStatus,
    carWashId: number,
    bayNumber: number,
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
    this.excecutionError = excecutionError;
    this.transactionId = transactionId;
    this.promoCodeId = promoCodeId;
    this.rewardPointsUsed = rewardPointsUsed;
    this.discountAmount = discountAmount;
  }

  public static create(data: ICreateOrderDto): Order {
    const {
      card,
      transactionId,
      sum,
      promoCodeId,
      carWashId,
      bayNumber,
      rewardPointsUsed,
    } = data;

    const createdAt: Date = new Date();

    if (rewardPointsUsed > 0) {
      if (card.balance < sum) {
        throw new OrderProcessingException()
      }

      if (rewardPointsUsed <= 0) {
        throw new OrderProcessingException()
      }
    } else if (card.isLocked === 1) {
      throw new OrderProcessingException()
    } else if (!transactionId) {
      throw new OrderProcessingException()
    } else if (sum < 0) {
      throw new OrderProcessingException()
    }

    const orderStatus: OrderStatus = OrderStatus.CREATED;

    return new Order(createdAt, sum, orderStatus, carWashId, bayNumber, {
      transactionId,
      promoCodeId,
      rewardPointsUsed,
      card: card,
    });
  }

  public static fromEntity(entity: OrderEntity): Order {
    const statusMappings = {
      CREATED: OrderStatus.CREATED,
      CANCELED: OrderStatus.CANCELED,
      COMPLETED: OrderStatus.COMPLETED,
    };
    const orderStatus = statusMappings[entity.orderStatus];
    const order = new Order(
      entity.createdAt,
      entity.sum,
      orderStatus,
      entity.carWashId,
      entity.bayNumber,
      {
        id: entity.id,
        transactionId: entity.transactionId,
        rewardPointsUsed: entity.rewardPointsUsed,
        discountAmount: entity.discountAmount,
        excecutionError: entity.excecutionError,
      },
    );

    return order;
  }
}
