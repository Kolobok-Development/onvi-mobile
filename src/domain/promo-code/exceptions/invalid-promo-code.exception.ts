import { ClientException } from '../../../infrastructure/common/exceptions/base.exceptions';
import { INVALID_PROMO_CODE_ERROR_CODE } from '../../../infrastructure/common/constants/constants';

export class InvalidPromoCodeException extends ClientException {
  constructor(promoCode: string) {
    super(
      INVALID_PROMO_CODE_ERROR_CODE,
      `Промокод ${promoCode} не действительный`,
    );
  }
}
