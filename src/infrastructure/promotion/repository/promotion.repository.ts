import { IPromotionRepository } from '../../../domain/promotion/promotion-repository.abstract';
import { Injectable } from '@nestjs/common';
import { Promotion } from '../../../domain/promotion/model/promotion.model';
import { Card } from '../../../domain/account/card/model/card';
import { InjectRepository } from '@nestjs/typeorm';
import { PromotionEntity } from '../entity/promotion.entity';
import { LessThan, MoreThan, Repository } from 'typeorm';
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

  async findActive(): Promise<Promotion[]> {
    const currentDate = new Date();

    const promotions = await this.promotionRepository.find({
      where: {
        isActive: 1, // Or true, depending on your database schema
        expiryDate: MoreThan(currentDate), // Use LessThan for comparisons
      },
    });

    // Handle the case where no promotions are found
    if (!promotions || promotions.length === 0) return [];

    // Map the entities to your Promotion objects
    return promotions.map((promotion) => Promotion.fromEntity(promotion));
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
