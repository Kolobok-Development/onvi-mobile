import { NotFoundException } from '../../../infrastructure/common/exceptions/base.exceptions';
import { PHONE_NUMBERS_DO_NOT_MATCH } from '../../../infrastructure/common/constants/constants';

export class PhoneNumbersDoNotMatch extends NotFoundException {
  constructor(phoneNew: string, phoneOld: string) {
    super(
      PHONE_NUMBERS_DO_NOT_MATCH,
      `New phone number ${phoneNew} does not match old phone number ${phoneOld}`,
    );
  }
}
