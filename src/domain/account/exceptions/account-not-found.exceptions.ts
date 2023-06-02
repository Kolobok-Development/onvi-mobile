import { NotFoundException } from '../../../infrastructure/common/exceptions/base.exceptions';
import { ACCOUNT_NOT_FOUND_EXCEPTION_CODE } from '../../../infrastructure/common/constants/constants';

export class AccountNotFoundExceptions extends NotFoundException {
  constructor(phone: string) {
    super(
      ACCOUNT_NOT_FOUND_EXCEPTION_CODE,
      `Account phone= ${phone} is not found`,
    );
  }
}
