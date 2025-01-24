import { ClientException } from '../../../infrastructure/common/exceptions/base.exceptions';

export class PaymentTimeoutException extends ClientException {
  constructor(transactionId: string) {
    super(
      1001,
      `Payment verification timed out for transaction: ${transactionId}`,
    );
  }
}
