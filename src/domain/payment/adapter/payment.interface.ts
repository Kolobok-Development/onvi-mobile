import { Payment } from '../model/payment';
import { ReciptDto } from '../../../infrastructure/payment/dto/recipt.dto';

export abstract class IPaymentRepository {
  abstract create(payment: Payment, recipt: ReciptDto): Promise<any>;
  abstract verify(id: string): Promise<any>;
  abstract refund(paymentId: string, reason?: string): Promise<any>;
}
