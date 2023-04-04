import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CardEntity } from '../entity/card.entity';
import { Repository } from 'typeorm';
import { ClientEntity } from '../entity/client.entity';
import { IAccountRepository } from '../../../domain/account/interface/account-repository.interface';
import { Client } from '../../../domain/account/model/client';
import { Card } from '../../../domain/account/model/card';

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
    const clientObject: ClientEntity = this.clientRepository.create({
      name: client.name,
      phone: client.phone,
      correctPhone: client.correctPhone,
      clientTypeId: client.clientTypeId,
      isActivated: client.isActivated,
      activatedDate: new Date(Date.now()),
    });

    //2) Save client id
    const newClient: ClientEntity = await this.clientRepository.save(
      clientObject,
    );

    //3) Create new Card
    const cardObject: CardEntity = this.cardRepository.create({
      nomer: card.nomer,
      devNomer: card.devNomer,
      cardTypeId: card.cardTypeId,
      client: newClient,
    });
    //4) return client entity
    await this.cardRepository.save(cardObject);
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
    const client: ClientEntity = await this.clientRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.cards', 'cards1')
      .leftJoin(
        (qb) =>
          qb
            .select('cards2.clientId', 'clientId')
            .addSelect('MAX(cards2.balance)', 'maxBalance')
            .from(CardEntity, 'cards2')
            .groupBy('cards2.clientId'),
        'maxCards',
        'maxCards.clientId = client.id',
      )
      .leftJoinAndSelect(
        'client.cards',
        'cards2',
        'cards2.balance = maxCards.maxBalance',
      )
      .where('client.correctPhone = :phone', { phone: phone })
      .getOne();

    return client;
  }

  setRefreshToken(phone: string, token: string): Promise<any> {
    return Promise.resolve(undefined);
  }
}
