import { Injectable } from '@nestjs/common';
import { IPaymentRepository } from '../../../domain/payment/adapter/payment.interface';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Amount, Payment } from '../../../domain/payment/model/payment';
import {
  Item,
  ReciptDto,
} from '../../../infrastructure/payment/dto/recipt.dto';
import { EnvConfigService } from '../../../infrastructure/config/env-config/env-config.service';

@Injectable()
export class PaymentUsecase {
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly env: EnvConfigService,
  ) {}

  public async create(
    data: CreatePaymentDto,
    receiptReturnPhoneNumber: string,
  ) {
    const amount: Amount = {
      value: String(data.amount),
      currency: 'RUB',
    };
    const payment: Payment = Payment.create({
      paymentToken: data.paymentToken,
      amount,
      capture: true,
      description: data.description,
      paymentMethodType: null,
      returnUrl: null,
    });

    const purchaseItem: Item = {
      description: data.description,
      amount,
      quantity: '1',
      vat_code: 2,
      payment_subject: 'commodity',
      payment_mode: 'full_payment',
    };
    const recipt: ReciptDto = {
      phone: receiptReturnPhoneNumber,
      items: [purchaseItem],
    };

    return await this.paymentRepository.create(payment, recipt);
  }

  public async verify(paymentId: string): Promise<any> {
    return await this.paymentRepository.verify(paymentId);
  }

  public async getGatewayCredentials(): Promise<any> {
    const credentials = {
      apiKey: this.env.getPaymentGatewayClientApiKey(),
      storeId: this.env.getPaymentGatewayStoreId(),
    };

    return credentials;
  }

  public async refund(paymentId: string, amount: number, reason: string) {
    const result = await this.paymentRepository.refund(
      paymentId,
      amount,
      reason,
    );
    return result;
  }
}
