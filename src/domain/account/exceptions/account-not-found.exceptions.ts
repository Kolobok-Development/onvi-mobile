import { NotFoundException } from '../../shared/excpetions/base.exceptions';
export const ACCOUNT_NOT_FOUND_EXCEPTION_CODE = 4;
export class AccountNotFoundExceptions extends NotFoundException {
  constructor(phone: string) {
    super(
      ACCOUNT_NOT_FOUND_EXCEPTION_CODE,
      `Account phone= ${phone} is not found`,
    );
  }
}
