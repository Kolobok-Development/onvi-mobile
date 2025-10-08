import { IPromoCodeRepository } from '../../../domain/promo-code/promo-code-repository.abstract';
import { Injectable } from '@nestjs/common';
import { PromoCode } from '../../../domain/promo-code/model/promo-code.model';
import { Card } from '../../../domain/account/card/model/card';
import { PromoCodeLocation } from '../../../domain/promo-code/model/promo-code-location';
import { PromoCodeEntity } from '../entity/promocode.entity';
import { PromoCodeLocationEntity } from '../entity/promo-code-location.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromoCodeUsageEntity } from '../entity/promo-code-usage.entity';
import { CardEntity } from '../../account/entity/card.entity';
import { PromoCodeToUserEntity } from '../entity/promo-code-to-user.entity';
import { ClientEntity } from '../../account/entity/client.entity';
import { Client } from '../../../domain/account/client/model/client';
import { GeocodingService } from '../../services/geocoding/geocoding.service';
import { CmnCityEntity } from 'src/infrastructure/cmn-city/entity/cmn-city.entity';

@Injectable()
export class PromoCodeRepository implements IPromoCodeRepository {
  constructor(
    @InjectRepository(PromoCodeEntity)
    private readonly promoCodeRepository: Repository<PromoCodeEntity>,
    @InjectRepository(PromoCodeUsageEntity)
    private readonly promoCodeUsageRepository: Repository<PromoCodeUsageEntity>,
    @InjectRepository(PromoCodeLocationEntity)
    private readonly promoCodeLocationRepository: Repository<PromoCodeLocationEntity>,
    @InjectRepository(PromoCodeToUserEntity)
    private readonly promoCodeToUserEntity: Repository<PromoCodeToUserEntity>,
    private readonly geocodingService: GeocodingService,
  ) {}
  async apply(
    promoCode: PromoCode,
    card: Card,
    carWashId: number,
    usage: number,
  ): Promise<any> {
    const promoCodeUsage = new PromoCodeUsageEntity();

    promoCodeUsage.promoCode = { id: promoCode.id } as PromoCodeEntity;
    promoCodeUsage.carWashId = carWashId;
    promoCodeUsage.card = { cardId: card.cardId } as CardEntity;
    promoCodeUsage.usageDate = new Date(Date.now());
    promoCodeUsage.usage = usage;

    return await this.promoCodeUsageRepository.save(promoCodeUsage);
  }

  async create(promoCode: PromoCode): Promise<PromoCode> {
    const promoCodeEntity = PromoCodeRepository.toPromoCodeEntity(promoCode);

    const newPromoCode = await this.promoCodeRepository.save(promoCodeEntity);
    return PromoCode.fromEntity(newPromoCode);
  }

  async bindClient(promoCode: PromoCode, client: Client): Promise<any> {
    const promoCodeToUserEntity = new PromoCodeToUserEntity();

    promoCodeToUserEntity.promoCode = { id: promoCode.id } as PromoCodeEntity;
    promoCodeToUserEntity.client = {
      clientId: client.clientId,
    } as ClientEntity;

    return await this.promoCodeToUserEntity.save(promoCodeToUserEntity);
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

  /*
    TODO
    1) add search by promocode
   */
  async validateUsageByCard(cardId: number, id: number): Promise<boolean> {
    const promoCodeHist = await this.promoCodeUsageRepository.find({
      where: {
        card: { cardId },
        promoCode: { id },
      },
      relations: ['card', 'promoCode'],
    });

    if (promoCodeHist.length == 0) return true;

    return false;
  }

  async findMaxUsageByCard(cardId: number, id: number): Promise<any> {
    const promoCodeUsage = await this.promoCodeUsageRepository.findOne({
      where: {
        card: { cardId },
        promoCode: { id },
      },
      relations: ['card', 'promoCode'],
      order: { usage: 'DESC' }, // Сортировка по usage в убывающем порядке
    });

    return promoCodeUsage; // Возвращаем найденную запись или null, если записей нет
  }

  async findByUserAndActive(
    cardId: number,
    clientId: number,
    location?: { latitude: number; longitude: number },
  ): Promise<PromoCode[]> {
    let regionCode: string | undefined;
  
    if (location) {
      try {
        const geocodeResult = await this.geocodingService.reverseGeocode(
          location.longitude,
          location.latitude,
        );
        regionCode = geocodeResult.regionCode;
      } catch (error) {
      }
    }
  
    const currentDate = new Date();
  
    // Подзапрос для получения общего количества использований по промокоду и карте
    const usageSubQuery = this.promoCodeRepository
      .createQueryBuilder('promocode')
      .subQuery()
      .select('COALESCE(SUM(usage.usage), 0)')
      .from(PromoCodeUsageEntity, 'usage')
      .where('usage.PROMO_CODE_ID = promocode.id')
      .andWhere('usage.CARD_ID = :cardId')
      .getQuery();
  
    // Основной запрос
    const query = this.promoCodeRepository
      .createQueryBuilder('promocode')
      .leftJoin(
        PromoCodeToUserEntity,
        'user',
        'user.PROMO_CODE_ID = promocode.id AND user.USER_ID = :clientId',
        { clientId }
      )
      .where('promocode.isActive = :isActive', { isActive: 1 })
      .andWhere('promocode.expiryDate > :currentDate', { currentDate })
      .andWhere('user.id IS NOT NULL')
      .andWhere(`(${usageSubQuery}) < promocode.usageAmount`)
      .setParameter('cardId', cardId);
  
    // Only join cmnCity if regionCode is defined
    if (regionCode) {
      query.leftJoin(
        CmnCityEntity,
        'cmn_city',
        'promocode.CMNCITY_ID = cmn_city.CMNCITY_ID',
      );
      query.andWhere('cmn_city.regionCode = :regionCode', { regionCode });
    }
  
    const promoCodes = await query.getMany();
  
    // Return the mapped promo codes
    return promoCodes.map((promoCode) => PromoCode.fromEntity(promoCode));
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
    promoCodeEnitity.usageAmount = promoCode.usageAmount;

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
