import { Card } from './model/card';
import { Client } from '../client/model/client';

export abstract class ICardRepository {
  abstract create(card: Card, client: Client): Promise<Card>;
  abstract findByClientId(clientId: number): Promise<Card[]>;
  abstract findOneByDevNomer(devNomer: string): Promise<Card>;
  abstract findOneByDevNomerWithUserId(devNomer: string): Promise<Card>;
  abstract changeType(cardId: number, newCardTypeId: number): Promise<any>;
  abstract delete(cardId: number): Promise<any>;
  abstract lock(cardId: number): Promise<void>;
  abstract reActivate(cardId: number): Promise<any>;
  abstract findGroupIdByCardId(cardId: number): Promise<number | null>;
}
