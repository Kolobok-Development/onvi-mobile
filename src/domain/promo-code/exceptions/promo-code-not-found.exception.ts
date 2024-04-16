import { NotFoundException } from '../../../infrastructure/common/exceptions/base.exceptions';
import { PROMO_CODE_NOT_FOUND_ERROR_CODE } from '../../../infrastructure/common/constants/constants';

export class PromoCodeNotFoundException extends NotFoundException {
  constructor(promCode: string) {
    super(PROMO_CODE_NOT_FOUND_ERROR_CODE, `Promo code ${promCode} not found`);
  }
}
