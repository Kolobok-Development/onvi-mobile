import { Injectable } from '@nestjs/common';
import { ICardRepository } from '../../../domain/account/card/card-repository.abstract';
import { InjectRepository } from '@nestjs/typeorm';
import { CardEntity } from '../entity/card.entity';
import { Repository } from 'typeorm';
import { Card } from '../../../domain/account/card/model/card';
import { Client } from '../../../domain/account/client/model/client';
import { ClientEntity } from '../entity/client.entity';
import { ClientRepository } from './client.repository';

@Injectable()
export class CardRepository implements ICardRepository {
  constructor(
    @InjectRepository(CardEntity)
    private readonly cardRepository: Repository<CardEntity>,
  ) {}
  async create(card: Card, client: Client): Promise<Card> {
    const cardEntity = this.toCardEntity(card);
    const clientEntity = ClientRepository.toClientEntity(client);

    cardEntity.client = clientEntity;

    const newCard = await this.cardRepository.save(cardEntity);
    return Card.fromEntity(newCard);
  }

  async delete(cardId: number): Promise<void> {
    return Promise.resolve(undefined);
  }

  async findByClientId(clientId: number): Promise<Card[]> {
    const card = await this.cardRepository
      .createQueryBuilder('card')
      .leftJoin('card.client', 'client')
      .where('client.clientId = :clientId', { clientId })
      .getMany();

    const cards = card.map((cardEntity: CardEntity) =>
      Card.fromEntity(cardEntity),
    );

    if (!cards) return null;

    return cards;
  }

  async findOneByDevNomer(devNomer: string): Promise<Card> {
    const card = await this.cardRepository.findOne({
      where: {
        devNomer: devNomer,
      },
    });

    if (!card) return null;
    return Card.fromEntity(card);
  }

  async lock(cardId: number): Promise<void> {
    return Promise.resolve(undefined);
  }



  private toCardEntity(card: Card): CardEntity {
    const cardEntity: CardEntity = new CardEntity();

    cardEntity.isLocked = card.isLocked;
    cardEntity.dateEnd = card.dateEnd;
    cardEntity.cardTypeId = card.cardTypeId;
    cardEntity.devNomer = card.devNomer;
    cardEntity.isDel = card.isDel;
    cardEntity.cmnCity = card.cmnCity;
    cardEntity.nomer = card.nomer;
    cardEntity.tag = card.tag;

    return cardEntity;
  }
}
