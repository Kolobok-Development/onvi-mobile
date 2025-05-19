import { ClientException } from '../../../infrastructure/common/exceptions/base.exceptions';
import { PAYMENT_ERROR_CODES } from '../../../infrastructure/common/constants/constants';

export class PaymentProcessingException extends ClientException {
  constructor() {
    super(PAYMENT_ERROR_CODES.PROCESSING_ERROR, 'Payment processing error');
  }
}
