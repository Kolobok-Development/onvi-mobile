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
  cmnCity: number;
  realBalance: number;
  airBalance: number;
  nomer: string;
  note?: string;
  tag?: string;
  mainCardId?: number;

  constructor(
    cardId: number,
    balance: number,
    isLocked: number,
    dateBegin: Date,
    dateEnd: Date,
    cardTypeId: number,
    devNomer: string,
    isDel: number,
    cmnCity: number,
    realBalance: number,
    airBalance: number,
    nomer: string,
    note: string,
    tag: string,
    mainCardId: number,
  ) {
    this.cardId = cardId;
    this.balance = balance;
    this.isLocked = isLocked;
    this.dateBegin = dateBegin;
    this.dateEnd = dateEnd;
    this.cardTypeId = cardTypeId;
    this.devNomer = devNomer;
    this.isDel = isDel;
    this.cmnCity = cmnCity;
    this.realBalance = realBalance;
    this.airBalance = airBalance;
    this.nomer = nomer;
    this.note = note;
    this.tag = tag;
    this.mainCardId = mainCardId;
  }
}
