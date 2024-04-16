import { Injectable } from '@nestjs/common';
import { IPromotionRepository } from '../../../domain/promotion/promotion-repository.abstract';
import { ApplyPromotionDto } from './dto/apply-promotion.dto';
import { Client } from '../../../domain/account/client/model/client';
import { Promotion } from '../../../domain/promotion/model/promotion.model';
import { PromotionNotFoundException } from '../../../domain/promotion/exceptions/promotion-not-found.exception';
import { InvalidPromotionException } from '../../../domain/promotion/exceptions/invalid-promotion.exception';
import { IOrderRepository } from '../../../domain/order/order-repository.abstract';
import { IAccountRepository } from '../../../domain/account/interface/account-repository.interface';

@Injectable()
export class PromotionUsecase {
  constructor(
    private readonly promotionRepository: IPromotionRepository,
    private readonly operationRepository: IOrderRepository,
    private readonly accauntRepository: IAccountRepository,
  ) {}

  async apply(data: ApplyPromotionDto, account: Client): Promise<any> {
    const card = account.getCard();
    const currentDate = new Date();
    let isActive = 0;
    const promotion: Promotion = await this.promotionRepository.findOneByCode(
      data.code,
    );
    if (!promotion) throw new PromotionNotFoundException(data.code);

    if (
      promotion.isActive == 0 ||
      new Date(promotion.expiryDate) < currentDate
    ) {
      throw new InvalidPromotionException(promotion.code);
    }

    const isUsed = await this.promotionRepository.validateUsageByCard(
      card.cardId,
      promotion.promotionId,
    );

    if (!isUsed) {
      throw new InvalidPromotionException(promotion.code);
    }

    if (promotion.type === 1) {
      console.log('point add');
      const extId = this.generateUniqueExt();
      const transactionId = await this.operationRepository.createTransaction(
        account,
        card,
        promotion,
        extId,
      );
      console.log(transactionId);
    } else if (promotion.type === 2) {
      console.log('cashback');
      await this.accauntRepository.changeTypeCard(
        card.cardId,
        promotion.cashbackType,
      );
      isActive = 1;
    }
    const expiryPeriodDate = new Date(
      Date.now() + promotion.periodUse * 24 * 60 * 60 * 1000,
    );
    await this.promotionRepository.apply(
      promotion,
      card,
      expiryPeriodDate,
      isActive,
    );

    return promotion;
  }
  generateUniqueExt() {
    const prefix = 'Promotion';
    const uniqueId = Date.now(); // получаем текущую дату и время в миллисекундах как уникальный идентификатор
    return `${prefix}_${uniqueId}`;
  }
}
