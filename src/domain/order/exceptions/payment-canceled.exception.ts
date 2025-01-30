import { ClientException } from '../../../infrastructure/common/exceptions/base.exceptions';

export class PaymentCanceledException extends ClientException {
  constructor(transactionId: string) {
    super(1002, `Payment was canceled for transaction: ${transactionId}`);
  }
}
