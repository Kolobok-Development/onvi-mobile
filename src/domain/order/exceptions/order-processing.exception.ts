import { ClientException } from '../../../infrastructure/common/exceptions/base.exceptions';
import { ORDER_PROCESSING_ERROR_CODE } from '../../../infrastructure/common/constants/constants';

export class OrderProcessingException extends ClientException {
  constructor() {
    super(ORDER_PROCESSING_ERROR_CODE, `Order processing error`);
  }
}
