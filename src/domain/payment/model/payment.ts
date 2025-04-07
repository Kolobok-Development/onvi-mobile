import { ICreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentProcessingException } from '../exceptions/payment-processing.exception';
import { IPaymentMethodType } from '@a2seven/yoo-checkout/build/types';

export class Amount {
  value: string;
  currency: string;
}

export enum PaymentStatus {
  PENDING = 'pending',
  WAITING = 'waiting_for_capture ',
  SUCCEEDED = 'succeeded',
  CANCELED = 'canceled',
}

export class Payment {
  paymentToken: string;
  amount: Amount;
  capture: boolean;
  description: string;
  paymentMethodType: IPaymentMethodType;

  private constructor(
    paymentToken: string,
    amount: Amount,
    capture: boolean,
    description: string,
    paymentMethodType: IPaymentMethodType,
  ) {
    this.paymentToken = paymentToken;
    this.amount = amount;
    this.capture = capture;
    this.description = description;
    this.paymentMethodType = paymentMethodType;
  }

  public static create(data: ICreatePaymentDto): Payment {
    const { paymentToken, amount, capture, description, paymentMethodType } =
      data;

    if (Number(amount.value) <= 0) {
      throw new PaymentProcessingException();
    }

    return new Payment(
      paymentToken,
      amount,
      capture,
      description,
      paymentMethodType,
    );
  }
}
