import { Injectable } from '@nestjs/common';
import { ICardRepository } from '../../../domain/account/card/card-repository.abstract';
import { InjectRepository } from '@nestjs/typeorm';
import { CardEntity } from '../entity/card.entity';
import { In, Repository } from 'typeorm';
import { Card } from '../../../domain/account/card/model/card';
import { Client } from '../../../domain/account/client/model/client';
import {CardMapper} from "../mapper/card.mapper";
import {ClientMapper} from "../mapper/client.mapper";

@Injectable()
export class CardRepository implements ICardRepository {
  constructor(
    @InjectRepository(CardEntity)
    private readonly cardRepository: Repository<CardEntity>,
  ) {}
  async create(card: Card, client: Client): Promise<Card> {
    const cardEntity = CardMapper.toCardEntity(card);
    const clientEntity = ClientMapper.toClientEntity(client);

    cardEntity.client = clientEntity;

    const newCard = await this.cardRepository.save(cardEntity);
    return CardMapper.fromEntity(newCard);
  }

  async delete(cardId: number): Promise<any> {
    const isDeleted = await this.cardRepository.update(
      { cardId: cardId },
      { isDel: 1 },
    );

    if (!isDeleted) return null;

    return isDeleted;
  }

  async findByClientId(clientId: number): Promise<Card[]> {
    const card = await this.cardRepository
      .createQueryBuilder('card')
      .leftJoin('card.client', 'client')
      .where('client.clientId = :clientId', { clientId })
      .getMany();

    const cards = card.map((cardEntity: CardEntity) =>
        CardMapper.fromEntity(cardEntity),
    );

    if (!cards) return null;

    return cards;
  }

  async findOneByDevNomer(devNomer: string): Promise<Card> {
    const card = await this.cardRepository.findOne({
      where: {
        devNomer: devNomer
      },
    });

    if (!card) return null;
    return CardMapper.fromEntity(card);
  }

  async changeType(cardId: number, newCardTypeId: number): Promise<any> {
    const card = await this.cardRepository.findOne({
      where: {
        cardId: cardId,
      },
    });

    if (!card) return null;
    card.cardTypeId = newCardTypeId;
    await this.cardRepository.save(card);
    return card;
  }

  async reActivate(cardId: number): Promise<any> {
    const card = await this.cardRepository.update({ cardId }, { isDel: 0 });

    if (!card) return null;

    return card;
  }

  async lock(cardId: number): Promise<void> {
    return Promise.resolve(undefined);
  }

  async findGroupIdByCardId(cardId: number): Promise<number | null> {
    const result = await this.cardRepository
        .createQueryBuilder('card')
        .leftJoin('CRDCARD_TYPE', 'type', 'card.CARD_TYPE_ID = type.CARD_TYPE_ID')
        .select('type.GROUP_ID', 'groupId')
        .where('card.CARD_ID = :cardId', { cardId })
        .getRawOne();

    return result ? result.groupId : null;
  }
}
