import { Injectable } from '@nestjs/common';
import { IPromotionHistoryRepository } from '../../../domain/promotion/promotionHistory-repository.abstract';
import { InjectRepository } from '@nestjs/typeorm';
import { PromotionHistEntity } from '../entity/promotion-hist.entity';
import { Repository } from 'typeorm';
import { Card } from '../../../domain/account/card/model/card';
import { PromotionHist } from '../../../domain/promotion/model/promotionHist';
import { Promotion } from '../../../domain/promotion/model/promotion.model';

@Injectable()
export class PromotionHistoryRepository implements IPromotionHistoryRepository {
  constructor(
    @InjectRepository(PromotionHistEntity)
    private readonly promotionHistoryRepository: Repository<PromotionHistEntity>,
  ) {}
  async getPromotionHistory(card: Card): Promise<PromotionHist[]> {
    const [hisotry, total] = await this.promotionHistoryRepository.findAndCount(
      {
        where: { cardId: card.cardId },
        order: { usageDate: 'DESC' },
      },
    );

    if (hisotry.length == 0) return [];

    return hisotry.map((transaction, i) =>
      PromotionHist.fromEntity(transaction),
    );
  }

  async getPromotionHistoryItem(
    card: Card,
    promotion: Promotion,
  ): Promise<PromotionHist> {
    const poromotionHistoryItem = await this.promotionHistoryRepository.findOne(
      { where: { cardId: card.cardId, promotionId: promotion.promotionId } },
    );

    if (!poromotionHistoryItem) return null;

    return PromotionHist.fromEntity(poromotionHistoryItem);
  }
}
