import { Injectable } from '@nestjs/common';
import { IAccountRepository } from '../../../domain/account/interface/account-repository.interface';
import { Client } from '../../../domain/account/client/model/client';
import { Card } from '../../../domain/account/card/model/card';
import { CardRepository } from './card.repository';
import { ClientRepository } from './client.repository';
import { ICreateCardDto } from '../../../domain/account/card/dto/create-card.dto';
import { ICreateClientDto } from '../../../domain/account/client/dto/create-client.dto';
import { CardType } from '../../../domain/account/card/enum/card-type.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { CardHistEntity } from '../entity/card-hist.enity';
import { Repository } from 'typeorm';
import { CardHist } from '../../../domain/account/card/model/cardHist';
import { TariffEntity } from '../entity/tariff.entity';
import { Tariff } from '../../../domain/account/card/model/tariff';
import { PromotionHist } from '../../../domain/promotion/model/promotionHist';
import { PromotionHistEntity } from '../../promotion/entity/promotion-hist.entity';

@Injectable()
export class AccountRepository implements IAccountRepository {
  constructor(
    @InjectRepository(CardHistEntity)
    private readonly cardHistoryRepository: Repository<CardHistEntity>,
    @InjectRepository(TariffEntity)
    private readonly tariffRepository: Repository<TariffEntity>,
    @InjectRepository(PromotionHistEntity)
    private readonly promotionHistoryRepository: Repository<PromotionHistEntity>,
    private readonly cardRepository: CardRepository,
    private readonly clientRepository: ClientRepository,
  ) {}

  async create(clientData: ICreateClientDto, uniqNomer: string): Promise<any> {
    const client: Client = Client.create(clientData);
    const newClient = await this.clientRepository.create(client);

    const cardData: ICreateCardDto = {
      clientId: newClient.clientId,
      nomer: uniqNomer,
      devNomer: uniqNomer,
      cardTypeId: CardType.ONVI,
      beginDate: new Date(Date.now()),
    };

    const card: Card = Card.create(cardData);

    const newCard = await this.cardRepository.create(card, newClient);

    client.addCard(newCard);

    return client;
  }
  async update(client: Client): Promise<Client> {
    return await this.clientRepository.update(client);
  }
  getBalance(cardNumber: string): Promise<Card> {
    return null;
  }

  async getCardHistory(
    unqNumber: string,
    size: number,
    page: number,
  ): Promise<CardHist[]> {
    const [hisotry, total] = await this.cardHistoryRepository.findAndCount({
      where: { unqCardNumber: unqNumber },
      order: { operDate: 'DESC' },
      take: size,
      skip: page,
    });

    if (hisotry.length == 0) return [];

    return hisotry.map((transaction, i) => CardHist.fromEntity(transaction));
  }
  async findCardTariff(card: Card) {
    const tariff = await this.tariffRepository.findOne({
      where: {
        cardTypeId: card.cardTypeId,
      },
    });

    if (!tariff) return null;

    return Tariff.fromEntity(tariff);
  }
  async findOneByPhoneNumber(phone: any): Promise<any> {
    //TODO
    // 1) Find customer by phone number

    const client = await this.clientRepository.findOneByPhone(phone);

    if (!client) return null;

    return client;
  }

  async findOneByDevNomer(uniqNomer: any): Promise<any> {
    //TODO
    // 1) Find customer by phone number

    const card = await this.cardRepository.findOneByDevNomer(uniqNomer);

    if (!card) return null;

    return card;
  }

  async changeTypeCard(cardId: number, newCardTypeId: number): Promise<any> {
    const card = await this.cardRepository.changeType(cardId, newCardTypeId);
    return card;
  }

  async setRefreshToken(phone: string, token: string): Promise<any> {
    await this.clientRepository.setRefreshToken(phone, token);
  }

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
}
