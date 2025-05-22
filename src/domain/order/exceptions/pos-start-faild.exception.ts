import { CARWASH_START_FAILED } from '../../../infrastructure/common/constants/constants';
import { ClientException } from '../../../infrastructure/common/exceptions/base.exceptions';

export class CarwashStartFailedException extends ClientException {
  constructor(message: string) {
    super(CARWASH_START_FAILED, `Failed to start carwash: ${message}`);
  }
}
