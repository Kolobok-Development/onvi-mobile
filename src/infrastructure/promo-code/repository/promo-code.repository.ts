import { IPromoCodeRepository } from '../../../domain/promo-code/promo-code-repository.abstract';
import { Injectable } from '@nestjs/common';
import { PromoCode } from '../../../domain/promo-code/model/promo-code.model';
import { Card } from '../../../domain/account/card/model/card';
import { PromoCodeLocation } from '../../../domain/promo-code/model/promo-code-location';
import { PromoCodeEntity } from '../enitity/promocode.entity';
import { PromoCodeLocationEntity } from '../enitity/promo-code-location.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromoCodeUsageEntity } from '../enitity/promo-code-usage.entity';
import { CardEntity } from '../../account/entity/card.entity';

@Injectable()
export class PromoCodeRepository implements IPromoCodeRepository {
  constructor(
    @InjectRepository(PromoCodeEntity)
    private readonly promoCodeRepository: Repository<PromoCodeEntity>,
    @InjectRepository(PromoCodeUsageEntity)
    private readonly promoCodeUsageRepository: Repository<PromoCodeUsageEntity>,
    @InjectRepository(PromoCodeLocationEntity)
    private readonly promoCodeLocationRepository: Repository<PromoCodeLocationEntity>,
  ) {}
  async apply(
    promoCode: PromoCode,
    card: Card,
    carWashId: number,
  ): Promise<any> {
    const promoCodeUsage = new PromoCodeUsageEntity();

    promoCodeUsage.promoCode = { id: promoCode.id } as PromoCodeEntity;
    promoCodeUsage.carWashId = carWashId;
    promoCodeUsage.card = { cardId: card.cardId } as CardEntity;
    promoCodeUsage.usageDate = new Date(Date.now());

    return await this.promoCodeUsageRepository.save(promoCodeUsage);
  }

  async findOneByCode(code: string): Promise<PromoCode> {
    const promoCode = await this.promoCodeRepository.findOne({
      where: {
        code: code,
      },
      relations: ['locations'],
    });

    if (!promoCode) return null;

    return PromoCode.fromEntity(promoCode);
  }

  async findOneById(id: number): Promise<PromoCode> {
    const promoCode = await this.promoCodeRepository.findOne({
      where: {
        id: id,
      },
      relations: ['locations'],
    });

    if (!promoCode) return null;

    return PromoCode.fromEntity(promoCode);
  }

  async validateUsageByCard(cardId: number): Promise<boolean> {
    const promoCodeHist = await this.promoCodeUsageRepository.find({
      where: {
        card: { cardId },
      },
      relations: ['card'],
    });

    if (promoCodeHist.length == 0) return true;

    return false;
  }

  private static toPromoCodeEntity(promoCode: PromoCode): PromoCodeEntity {
    const promoCodeEnitity: PromoCodeEntity = new PromoCodeEntity();

    promoCodeEnitity.id = promoCode.id;
    promoCodeEnitity.code = promoCode.code;
    promoCodeEnitity.discount = promoCode.discount;
    promoCodeEnitity.discountType = promoCode.discountType;
    promoCodeEnitity.expiryDate = promoCode.expiryDate;
    promoCodeEnitity.isActive = promoCode.isActive;
    promoCodeEnitity.createdAt = promoCode.createdAt;
    promoCodeEnitity.createdBy = promoCode.createdBy;

    return promoCodeEnitity;
  }

  private static toPromoCodeLocationEntity(
    promoCodeLocation: PromoCodeLocation,
  ): PromoCodeLocationEntity {
    const promoCodeLocationEntity: PromoCodeLocationEntity =
      new PromoCodeLocationEntity();

    promoCodeLocationEntity.id = promoCodeLocation.id;
    promoCodeLocationEntity.carwashId = promoCodeLocation.carWashId;

    return promoCodeLocationEntity;
  }
}
