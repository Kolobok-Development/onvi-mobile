import { Injectable } from '@nestjs/common';
import { Client } from '../../../domain/account/client/model/client';
import { IPromoCodeRepository } from '../../../domain/promo-code/promo-code-repository.abstract';
import { VerifyPromoDto } from './dto/verify-promo.dto';
import { PromoCodeLocation } from '../../../domain/promo-code/model/promo-code-location';
import { PromoVerificationResponseDto } from './dto/promo-verification-response.dto';
import { PromoCode } from '../../../domain/promo-code/model/promo-code.model';
import { InvalidPromoCodeException } from '../../../domain/promo-code/exceptions/invalid-promo-code.exception';
import { PromoCodeNotFoundException } from '../../../domain/promo-code/exceptions/promo-code-not-found.exception';

@Injectable()
export class OrderUsecase {
  constructor(private readonly promoCodeRepository: IPromoCodeRepository) {}

  async validatePromo(
    data: VerifyPromoDto,
    client: Client,
  ): Promise<PromoVerificationResponseDto> {
    const card = client.getCard();
    const promoCodeValue = data.promoCode.replace(/\s+/g, '');
    const promoCode = await this.promoCodeRepository.findOneByCode(
      promoCodeValue,
    );
    const currentDate = new Date();

    if (!PromoCode) throw new PromoCodeNotFoundException(promoCodeValue);

    //validate promocode date
    if (
      promoCode.isActive == 0 ||
      new Date(promoCode.expiryDate) < currentDate
    ) {
      throw new InvalidPromoCodeException(promoCode.code);
    }

    const promoCodeUsage: any =
      await this.promoCodeRepository.findMaxUsageByCard(
        card.cardId,
        promoCode.id,
      );

    if (promoCodeUsage && promoCodeUsage.usage >= promoCode.usageAmount) {
      throw new InvalidPromoCodeException(promoCode.code);
    }

    // Promocode is assigned to speceific location, need to validate if location matching
    if (promoCode.locations.length > 0) {
      const isLocationAllowed = promoCode.locations.some(
        (location: PromoCodeLocation) => location.carWashId === data.carWashId,
      );

      if (!isLocationAllowed) {
        throw new InvalidPromoCodeException(promoCode.code);
      }
    }

    return {
      valid: true,
      id: promoCode.id,
      type: promoCode.discountType,
      discount: promoCode.discount,
    };
  }
}
