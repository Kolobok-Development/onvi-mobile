import { ClientException } from '../../shared/excpetions/base.exceptions';
export const ACCOUNT_EXISTS_CLIENT_EXCEPTION_CODE = 41;
export class AccountExistsException extends ClientException {
  constructor(phone: string) {
    super(
      ACCOUNT_EXISTS_CLIENT_EXCEPTION_CODE,
      `Account phone= ${phone} already exists`,
    );
  }
}
