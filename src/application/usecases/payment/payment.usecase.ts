import { Injectable } from '@nestjs/common';
import { IPaymentRepository } from '../../../domain/payment/adapter/payment.interface';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Client } from '../../../domain/account/client/model/client';
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

  public async create(data: CreatePaymentDto, clint: Client) {
    const amount: Amount = {
      value: String(data.amount),
      currency: 'RUB',
    };
    const payment: Payment = Payment.create({
      paymentToken: data.paymentToken,
      amount,
      capture: true,
      description: data.description,
    });

    const purchaseItem: Item = {
      description: data.description,
      amount,
      quantity: '1',
      vat_code: 4,
    };
    const recipt: ReciptDto = {
      phone: clint.correctPhone,
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
}
