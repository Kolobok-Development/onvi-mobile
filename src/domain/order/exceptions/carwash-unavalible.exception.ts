import { ClientException } from '../../../infrastructure/common/exceptions/base.exceptions';
import { CARWASH_UNAVALIBLE_ERROR_CODE } from '../../../infrastructure/common/constants/constants';

export class CarwashUnavalibleException extends ClientException {
  constructor() {
    super(CARWASH_UNAVALIBLE_ERROR_CODE, `The car wash canceled the order`);
  }
}
