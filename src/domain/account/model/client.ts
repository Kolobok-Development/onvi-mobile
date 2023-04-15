import { Card } from './card';

export class Client {
  clientId: number;
  name: string;
  inn?: string;
  email?: string;
  phone: string;
  birthday?: Date;
  insDate: Date;
  updDate?: Date;
  clientTypeId: number;
  note?: string;
  isActivated?: number;
  genderId?: number;
  correctPhone: string;
  refreshToken?: string;
  tokenId?: string;
  isTokeValid?: string;
  activatedDate?: Date;
  isLk?: number;
  tag?: string;
  cards?: Card[];


  constructor(clientId: number, name: string, inn: string, email: string, phone: string, birthday: Date, insDate: Date, updDate: Date, clientTypeId: number, note: string, isActivated: number, genderId: number, correctPhone: string, refreshToken: string, tokenId: string, isTokeValid: string, activatedDate: Date, isLk: number, tag: string, cards: Card[]) {
    this.clientId = clientId;
    this.name = name;
    this.inn = inn;
    this.email = email;
    this.phone = phone;
    this.birthday = birthday;
    this.insDate = insDate;
    this.updDate = updDate;
    this.clientTypeId = clientTypeId;
    this.note = note;
    this.isActivated = isActivated;
    this.genderId = genderId;
    this.correctPhone = correctPhone;
    this.refreshToken = refreshToken;
    this.tokenId = tokenId;
    this.isTokeValid = isTokeValid;
    this.activatedDate = activatedDate;
    this.isLk = isLk;
    this.tag = tag;
    this.cards = cards;
  }
}
