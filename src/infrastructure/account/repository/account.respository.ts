import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CardEntity } from '../entity/card.entity';
import { Repository } from 'typeorm';
import { ClientEntity } from '../entity/client.entity';
import { IAccountRepository } from '../../../domain/account/interface/account-repository.interface';
import { Client } from '../../../domain/account/model/client';
import { Card } from '../../../domain/account/model/card';
import { plainToClass } from 'class-transformer';

@Injectable()
export class AccountRespository implements IAccountRepository {
  constructor(
    @InjectRepository(CardEntity)
    private readonly cardRepository: Repository<CardEntity>,
    @InjectRepository(ClientEntity)
    private readonly clientRepository: Repository<ClientEntity>,
  ) {}

  async create(card: Card, client: Client): Promise<any> {
    //TODO
    //1) Create client
    const clientEntity = this.toClientEntity(client);
    const newClientE = await this.clientRepository.save(clientEntity);

    const cardEntity = this.toCardEntity(card);
    cardEntity.client = newClientE;

    const newCardE = await this.cardRepository.save(cardEntity);

    const newClient = this.toClient(newClientE);
    const newCard = this.toCard(newCardE);

    newClient.cards = [newCard];

    return newClient;
  }
  update(client: Client): Promise<Client> {
    return null;
  }
  getBalance(cardNumber: string): Promise<Card> {
    return null;
  }
  async findOneByPhoneNumber(phone: any): Promise<any> {
    //TODO
    // 1) Find customer by phone number

    /*
       const maxCardBalance: any = this.cardRepository
      .createQueryBuilder('maxClient')
      .leftJoin('maxClient.cards', 'maxCards')
      .where('maxClient.correctPhone = :phone', { phone: phone })
      .addSelect('MAX(maxCards.balance', 'maxBalance');
     */

    const client: any = await this.clientRepository
      .createQueryBuilder('client')
      .innerJoin('client.cards', 'card')
      .where('client.correctPhone = :phone', { phone: phone })
      .select(['client', 'card'])
      .orderBy('card.balance', 'DESC')
      .limit(1)
      .getOne();

    return client;
  }

  async setRefreshToken(phone: string, token: string): Promise<any> {
    const client: ClientEntity = await this.findOneByPhoneNumber(phone);

    if (!client) {
      return null;
    }

    client.refreshToken = token;

    return this.clientRepository.save(client);
  }

  private toClient(clientEntity: ClientEntity): Client {
    return new Client(
      clientEntity.clientId,
      clientEntity.name,
      clientEntity.inn,
      clientEntity.email,
      clientEntity.phone,
      clientEntity.birthday,
      clientEntity.insDate,
      clientEntity.updDate,
      clientEntity.clientTypeId,
      clientEntity.note,
      clientEntity.isActivated,
      clientEntity.genderId,
      clientEntity.correctPhone,
      clientEntity.refreshToken,
      clientEntity.tokenId,
      clientEntity.isTokeValid,
      clientEntity.activatedDate,
      clientEntity.isLk,
      clientEntity.tag,
      clientEntity.cards,
    );
  }
  private toClientEntity(client: Client): ClientEntity {
    const clientEntity: ClientEntity = new ClientEntity();

    clientEntity.name = client.name;
    clientEntity.inn = client.email;
    clientEntity.email = client.email;
    clientEntity.phone = client.phone;
    clientEntity.birthday = client.birthday;
    clientEntity.clientTypeId = client.clientTypeId;
    clientEntity.note = client.note;
    clientEntity.isActivated = client.isActivated;
    clientEntity.genderId = client.genderId;
    clientEntity.correctPhone = client.correctPhone;
    clientEntity.refreshToken = client.refreshToken;
    clientEntity.isTokeValid = client.isTokeValid;
    clientEntity.activatedDate = client.activatedDate;
    clientEntity.isLk = client.isLk;
    clientEntity.tag = client.tag;

    return clientEntity;
  }

  private toCard(cardEntity: CardEntity): Card {
    return new Card(
      cardEntity.cardId,
      cardEntity.balance,
      cardEntity.isLocked,
      cardEntity.dateBegin,
      cardEntity.dateEnd,
      cardEntity.cardTypeId,
      cardEntity.devNomer,
      cardEntity.isDel,
      cardEntity.cmnCity,
      cardEntity.realBalance,
      cardEntity.airBalance,
      cardEntity.nomer,
      cardEntity.note,
      cardEntity.tag,
      cardEntity.mainCardId,
    );
  }

  private toCardEntity(card: Card): Card {
    const cardEntity: CardEntity = new CardEntity();

    cardEntity.isLocked = card.isLocked;
    cardEntity.dateEnd = card.dateEnd;
    cardEntity.cardTypeId = card.cardTypeId;
    cardEntity.devNomer = card.devNomer;
    cardEntity.isDel = card.isDel;
    cardEntity.cmnCity = card.cmnCity;
    cardEntity.nomer = card.nomer;
    cardEntity.note = card.note;
    cardEntity.tag = card.tag;

    return cardEntity;
  }
}
