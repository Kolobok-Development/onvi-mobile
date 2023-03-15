import { Client } from './client';

export class Card {
  cardId: number;
  balance: number;
  isLocked?: number;
  dateBegin: Date;
  dateEnd?: Date;
  client: Client;
  cardTypeId: number;
  devNomer: string;
  isDel?: number;
  avto?: string;
  monthLimit?: number;
  discount?: number;
  gosNomer?: string;
  cmnCity: number;
  realBalance: number;
  airBalance: number;
  keyBalance: number;
  nomer: string;
  modelId?: number;
  note?: string;
  tag?: string;
  dayLimit?: number;
  mainCardId?: number;
}
