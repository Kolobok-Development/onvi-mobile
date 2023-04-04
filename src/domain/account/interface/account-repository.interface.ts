import { Card } from '../model/card';
import { Client } from '../model/client';

export interface IAccountRepository {
  create(card: Card, client: Client): Promise<any>;
  update(client: Client): Promise<Client>;
  getBalance(cardNumber: string): Promise<Card>;
  findOneByPhoneNumber(phone: string): Promise<any>;
  setRefreshToken(phone: string, token: string): Promise<any>;
}
