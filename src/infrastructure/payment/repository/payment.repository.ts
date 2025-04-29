import { Inject, Injectable } from '@nestjs/common';
import { PaymentToken } from '../provider/payment-gateway.provider';
import { Payment } from '../../../domain/payment/model/payment';
import { ReciptDto } from '../dto/recipt.dto';
import { v4 as uuidv4 } from 'uuid';
import { IPaymentRepository } from '../../../domain/payment/adapter/payment.interface';
import { IPaymentMethodType } from '@a2seven/yoo-checkout/build/types';
@Injectable()
export class PaymentRepository implements IPaymentRepository {
  constructor(@Inject(PaymentToken) private readonly paymentGateway: any) {}

  public async create(data: Payment, receipt: ReciptDto) {
    const { paymentToken, amount, capture, description, returnUrl } = data;

    const payment = await this.paymentGateway.createPayment({
      payment_token: paymentToken,
      receipt,
      amount,
      capture,
      description,
    });

    return payment;
  }

  public async verify(paymentId: string): Promise<any> {
    const payment = await this.paymentGateway.getPayment(paymentId);

    return {
      status: payment.status,
    };
  }
}


