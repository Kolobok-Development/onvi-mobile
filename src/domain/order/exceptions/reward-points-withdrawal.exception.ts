import { ServerException } from '../../../infrastructure/common/exceptions/base.exceptions';

export class RewardPointsWithdrawalException extends ServerException {
  constructor() {
    super(2001, 'Failed to withdraw reward points.');
  }
}
