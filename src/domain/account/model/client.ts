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
  insUserId?: number;
  updUserId?: number;
  clientTypeId: number;
  note?: string;
  avto?: string;
  isActivated?: number;
  discount?: number;
  genderId?: number;
  correctPhone: string;
  refreshToken?: string;
  tokenId?: string;
  isTokeValid?: string;
  activatedDate?: Date;
  isActiveLight?: number;
  activatedDateLight?: Date;
  isLk?: number;
  tag?: string;
  cards: Card[];
}
