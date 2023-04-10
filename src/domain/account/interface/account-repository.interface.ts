import { Card } from '../model/card';
import { Client } from '../model/client';

export abstract class IAccountRepository {
  abstract create(card: Card, client: Client): Promise<any>;
  abstract update(client: Client): Promise<Client>;
  abstract getBalance(cardNumber: string): Promise<Card>;
  abstract findOneByPhoneNumber(phone: string): Promise<any>;
  abstract setRefreshToken(phone: string, token: string): Promise<any>;
}
