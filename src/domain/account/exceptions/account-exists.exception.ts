import { ClientException } from '../../../infrastructure/common/exceptions/base.exceptions';
import { ACCOUNT_EXISTS_CLIENT_EXCEPTION_CODE } from '../../../infrastructure/common/constants/constants';

export class AccountExistsException extends ClientException {
  constructor(phone: string) {
    super(
      ACCOUNT_EXISTS_CLIENT_EXCEPTION_CODE,
      `Account phone= ${phone} already exists`,
    );
  }
}
