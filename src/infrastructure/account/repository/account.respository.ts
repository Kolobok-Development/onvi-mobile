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

@Injectable()
export class AccountRespository implements IAccountRepository {
  constructor(
    @InjectRepository(CardHistEntity)
    private readonly cardHistoryRepository: Repository<CardHistEntity>,
    private readonly cardRepository: CardRepository,
    private readonly clientRepository: ClientRepository,
  ) {}

  async create(clientData: ICreateClientDto): Promise<any> {
    const client: Client = Client.create(clientData);
    const newClient = await this.clientRepository.create(client);

    const cardData: ICreateCardDto = {
      clientId: newClient.clientId,
      nomer: newClient.correctPhone,
      devNomer: newClient.correctPhone,
      cardTypeId: CardType.ONVI,
      beginDate: new Date(Date.now()),
    };

    const card: Card = Card.create(cardData);

    const newCard = await this.cardRepository.create(card, newClient);

    client.addCard(newCard);

    return client;
  }
  update(client: Client): Promise<Client> {
    return null;
  }
  getBalance(cardNumber: string): Promise<Card> {
    return null;
  }

  async getCardHisotry(): Promise<any> {

  }
  async findOneByPhoneNumber(phone: any): Promise<any> {
    //TODO
    // 1) Find customer by phone number

    const client = await this.clientRepository.findOneByPhone(phone);

    /*
    const client: any = await this.clientRepository
      .createQueryBuilder('client')
      .innerJoin('client.cards', 'card')
      .where('client.correctPhone = :phone', { phone: phone })
      .select(['client', 'card'])
      .orderBy('card.balance', 'DESC')
      .limit(1)
      .getOne();

    return this.toClient(client);

     */

    return client;
  }

  async setRefreshToken(phone: string, token: string): Promise<any> {
    await this.clientRepository.setRefreshToken(phone, token);
  }
}
