import { IPromotionRepository } from '../../../domain/promotion/promotion-repository.abstract';
import { Injectable } from '@nestjs/common';
import { Promotion } from '../../../domain/promotion/model/promotion.model';
import { Card } from '../../../domain/account/card/model/card';
import { InjectRepository } from '@nestjs/typeorm';
import { PromotionEntity } from '../entity/promotion.entity';
import { Repository } from 'typeorm';
import { PromotionUsageEntity } from '../entity/promotion-usage.entity';
import { CardEntity } from '../../account/entity/card.entity';

@Injectable()
export class PromotionRepository implements IPromotionRepository {
  constructor(
    @InjectRepository(PromotionEntity)
    private readonly promotionRepository: Repository<PromotionEntity>,
    @InjectRepository(PromotionUsageEntity)
    private readonly promotionUsageRepository: Repository<PromotionUsageEntity>,
  ) {}
  async apply(
    promotion: Promotion,
    card: Card,
    expiryPeriodDate: Date,
    isActive: number,
  ): Promise<any> {
    const promotionUsage = new PromotionUsageEntity();

    promotionUsage.promotion = {
      promotionId: promotion.promotionId,
    } as PromotionEntity;
    promotionUsage.card = { cardId: card.cardId } as CardEntity;
    promotionUsage.expiryPeriodDate = expiryPeriodDate;
    promotionUsage.isActive = isActive;

    return await this.promotionUsageRepository.save(promotionUsage);
  }

  async findOneByCode(code: string): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({
      where: {
        code: code,
      },
    });

    if (!promotion) return null;

    return Promotion.fromEntity(promotion);
  }

  async findOneById(promotionId: number): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({
      where: {
        promotionId: promotionId,
      },
    });

    if (!promotion) return null;

    return Promotion.fromEntity(promotion);
  }

  async validateUsageByCard(
    cardId: number,
    promotionId: number,
  ): Promise<boolean> {
    const promotionHist = await this.promotionUsageRepository.find({
      where: {
        card: { cardId },
        promotion: { promotionId },
      },
      relations: ['card', 'promotion'],
    });

    return promotionHist.length == 0;
  }
}
