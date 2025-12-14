import { Injectable } from '@nestjs/common';
import { ITariffRepository } from '../../../domain/account/card/tariff-repository.abstract';
import { InjectRepository } from '@nestjs/typeorm';
import { TariffEntity } from '../entity/tariff.entity';
import { Repository } from 'typeorm';
import { Card } from '../../../domain/account/card/model/card';
import { TariffMapper } from '../mapper/tariff.mapper';

@Injectable()
export class TariffRepository implements ITariffRepository {
  constructor(
    @InjectRepository(TariffEntity)
    private readonly tariffRepository: Repository<TariffEntity>,
  ) {}

  async findCardTariff(card: Card) {
    const tariff = await this.tariffRepository.findOne({
      where: {
        cardTypeId: card.cardTypeId,
      },
    });

    if (!tariff) return null;

    return TariffMapper.fromEntity(tariff);
  }
}
