import { ClientException } from '../../../infrastructure/common/exceptions/base.exceptions';
import { PAYMENT_PROCESSING_ERROR_CODE } from '../../../infrastructure/common/constants/constants';

export class PaymentProcessingException extends ClientException {
  constructor() {
    super(PAYMENT_PROCESSING_ERROR_CODE, 'Payment processing error');
  }
}
