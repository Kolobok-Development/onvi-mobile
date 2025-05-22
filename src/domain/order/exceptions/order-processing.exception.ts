import { ClientException } from '../../../infrastructure/common/exceptions/base.exceptions';
import { ORDER_ERROR_CODES } from '../../../infrastructure/common/constants/constants';

export class OrderProcessingException extends ClientException {
  constructor() {
    super(ORDER_ERROR_CODES.PROCESSING_ERROR, `Order processing error`);
  }
}
