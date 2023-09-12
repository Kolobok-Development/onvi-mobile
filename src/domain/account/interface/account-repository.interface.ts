import { Card } from '../card/model/card';
import { Client } from '../client/model/client';
import { ICreateCardDto } from '../card/dto/create-card.dto';
import { ICreateClientDto } from '../client/dto/create-client.dto';
import { CardHist } from '../card/model/cardHist';
import {Tariff} from "../card/model/tariff";

export abstract class IAccountRepository {
  abstract create(clientData: ICreateClientDto): Promise<any>;
  abstract update(client: Client): Promise<any>;
  abstract getCardHistory(
    unqNumber: string,
    size: number,
    page: number,
  ): Promise<CardHist[]>;
  abstract findOneByPhoneNumber(phone: string): Promise<any>;
  abstract setRefreshToken(phone: string, token: string): Promise<any>;
  abstract findCardTariff(card: Card): Promise<Tariff>;
}
