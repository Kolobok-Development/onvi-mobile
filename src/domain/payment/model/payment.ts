import { ICreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentProcessingException } from '../exceptions/payment-processing.exception';

export class Amount {
  value: string;
  currency: string;
}

export class Payment {
  paymentToken: string;
  amount: Amount;
  capture: boolean;
  description: string;

  private constructor(
    paymentToken: string,
    amount: Amount,
    capture: boolean,
    description: string,
  ) {
    this.paymentToken = paymentToken;
    this.amount = amount;
    this.capture = capture;
    this.description = description;
  }

  public static create(data: ICreatePaymentDto): Payment {
    const { paymentToken, amount, capture, description } = data;

    if (Number(amount.value) <= 0) {
      throw new PaymentProcessingException();
    }

    return new Payment(paymentToken, amount, capture, description);
  }
}
