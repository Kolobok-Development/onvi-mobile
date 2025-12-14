import { ClientException } from '../../../infrastructure/common/exceptions/base.exceptions';
import { ORDER_ERROR_CODES } from '../../../infrastructure/common/constants/constants';

export class InsufficientFreeVacuumException extends ClientException {
  constructor() {
    super(
      ORDER_ERROR_CODES.INSUFFICIENT_FREE_VACUUM,
      'There are no free vacuum cleaner launches.',
    );
  }
}
