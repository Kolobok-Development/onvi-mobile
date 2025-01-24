import { ClientException } from '../../../infrastructure/common/exceptions/base.exceptions';

export class InsufficientRewardPointsException extends ClientException {
  constructor() {
    super(1003, 'Insufficient reward points.');
  }
}
