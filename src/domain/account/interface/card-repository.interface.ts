import { Card } from '../model/card';

export interface ICardRepository {
  findOneByNumber(number: string): Promise<Card>;
  findOneByUnqNumber(unqNumber: string): Promise<Card>;
  create(card: any): Promise<Card>;
  update(filter: any, date: any): Promise<Card>;
}
