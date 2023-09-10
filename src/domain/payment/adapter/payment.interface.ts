import { Payment } from '../model/payment';
import { ReciptDto } from '../../../infrastructure/payment/dto/recipt.dto';

export abstract class IPaymentRepository {
  abstract create(payment: Payment, recipt: ReciptDto): Promise<any>;
  abstract getPayment(id: string): Promise<any>;
}
