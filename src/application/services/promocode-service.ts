import { Injectable } from '@nestjs/common';
import { Order } from '../../domain/order/model/order';
import { Card } from '../../domain/account/card/model/card';
import { OrderProcessingException } from '../../domain/order/exceptions/order-processing.exception';
import { PromoCode } from '../../domain/promo-code/model/promo-code.model';
import { IPromoCodeRepository } from '../../domain/promo-code/promo-code-repository.abstract';

@Injectable()
export class PromoCodeService {
  constructor(private readonly promoCodeRepository: IPromoCodeRepository) {}

  async applyPromoCode(order: Order, card: Card): Promise<number> {
    const promoCode = await this.promoCodeRepository.findOneById(
      order.promoCodeId,
    );

    if (!promoCode) throw new OrderProcessingException();

    const discountAmount = this.calculateDiscount(order.originalSum, order.sum, promoCode);
    order.discountAmount = discountAmount;

    const usageAmount = await this.incrementUsage(card, promoCode);
    await this.promoCodeRepository.apply(
      promoCode,
      card,
      order.carWashId,
      usageAmount,
    );

    return discountAmount;
  }

  private calculateDiscount(originalSum: number, sum: number, promoCode: PromoCode): number {
    if (promoCode.discountType === 1) {
      return originalSum - sum;
    } else if (promoCode.discountType === 2) {
      return Math.round((promoCode.discount / 100) * originalSum);
    }
    return 0;
  }

  private async incrementUsage(
    card: Card,
    promoCode: PromoCode,
  ): Promise<number> {
    const promoCodeUsage = await this.promoCodeRepository.findMaxUsageByCard(
      card.cardId,
      promoCode.id,
    );
    return promoCodeUsage ? promoCodeUsage.usage + 1 : 1;
  }
}
