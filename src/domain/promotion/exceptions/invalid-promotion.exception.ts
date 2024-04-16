import { ClientException } from '../../../infrastructure/common/exceptions/base.exceptions';
import { INVALID_PROMO_CODE_ERROR_CODE } from '../../../infrastructure/common/constants/constants';

export class InvalidPromotionException extends ClientException {
  constructor(promoCode: string) {
    super(
      INVALID_PROMO_CODE_ERROR_CODE,
      `Promo code ${promoCode} not valid`,
    );
  }
}
