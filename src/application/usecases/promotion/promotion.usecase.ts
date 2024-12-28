import { Injectable } from '@nestjs/common';
import { IPromotionRepository } from '../../../domain/promotion/promotion-repository.abstract';
import { ApplyPromotionDto } from './dto/apply-promotion.dto';
import { Client } from '../../../domain/account/client/model/client';
import { Promotion } from '../../../domain/promotion/model/promotion.model';
import { PromotionNotFoundException } from '../../../domain/promotion/exceptions/promotion-not-found.exception';
import { InvalidPromotionException } from '../../../domain/promotion/exceptions/invalid-promotion.exception';
import {ITransactionRepository} from "../../../domain/transaction/transaction-repository.abstract";
import {ICardRepository} from "../../../domain/account/card/card-repository.abstract";
import {IPromotionHistoryRepository} from "../../../domain/promotion/promotionHistory-repository.abstract";
import {PromotionHist} from "../../../domain/promotion/model/promotionHist";

@Injectable()
export class PromotionUsecase {
  constructor(
    private readonly promotionRepository: IPromotionRepository,
    private readonly promotionHistoryRepository: IPromotionHistoryRepository,
    private readonly transactionRepository: ITransactionRepository,
    private readonly cardRepository: ICardRepository,
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
      const extId = this.generateUniqueExt();
      const transactionId = await this.transactionRepository.create(
        account,
        card,
        promotion.point.toString(),
        extId,
      );
      console.log(transactionId);
    } else if (promotion.type === 2) {
      await this.cardRepository.changeType(
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

  async getActivePromotions() {
    const promotions = await this.promotionRepository.findActive();

    if (!promotions)
      throw new PromotionNotFoundException('No promotions found.');

    return promotions;
  }

  async getPromotionHistory(client: Client): Promise<PromotionHist[]> {
    const card = client.getCard();
    return await this.promotionHistoryRepository.getPromotionHistory(card);
  }

  generateUniqueExt() {
    const prefix = 'Promotion';
    const uniqueId = Date.now(); // получаем текущую дату и время в миллисекундах как уникальный идентификатор
    return `${prefix}_${uniqueId}`;
  }
}
