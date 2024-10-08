import { Card } from '../../card/model/card';
import { GenderType } from '../enum/gender.enum';
import { ClientType } from '../enum/clinet-type.enum';
import { ICreateClientDto } from '../dto/create-client.dto';
import { ActivationStatusType } from '../enum/activation-status.enum';
import { ClientEntity } from '../../../../infrastructure/account/entity/client.entity';
import { CardEntity } from '../../../../infrastructure/account/entity/card.entity';
import { ShortClientDto } from '../dto/short-client.dto';
import { AvatarType } from '../enum/avatar.enum';
import {OnviMeta} from "./onviMeta";

export class Client {
  clientId?: number;
  name: string;
  email?: string;
  phone: string;
  correctPhone: string;
  birthday?: Date;
  insDate?: Date;
  updDate?: Date;
  clientTypeId: ClientType;
  isActivated: number;
  userOnvi: number;
  isNotifications: number;
  avatarOnvi: AvatarType;
  activatedDate?: Date;
  genderId?: GenderType;
  refreshToken?: string;
  cards?: Card[];

  private constructor(
    name: string,
    rawPhone: string,
    phone: string,
    clientType: ClientType,
    refreshToken: string,
    isActivated: number,
    userOnvi: number,
    isNotifications: number,
    avatarOnvi: AvatarType,
    {
      clientId,
      email,
      birthday,
      cards,
      insDate,
      updDate,
      activationDate,
      genderId,
    }: {
      clientId?: number;
      email?: string;
      birthday?: Date;
      cards?: Card[];
      insDate?: Date;
      updDate?: Date;
      activationDate?: Date;
      genderId?: GenderType;
    },
  ) {
    this.name = name;
    this.phone = rawPhone;
    this.correctPhone = phone;
    this.clientTypeId = clientType;
    this.refreshToken = refreshToken;
    this.email = email;
    this.birthday = birthday;
    this.cards = cards;
    this.insDate = insDate;
    this.updDate = updDate;
    this.isActivated = isActivated;
    this.userOnvi = userOnvi;
    this.isNotifications = isNotifications;
    this.avatarOnvi = avatarOnvi;
    this.activatedDate = activationDate;
    this.genderId = genderId;
    this.clientId = clientId;
  }

  public static create(data: ICreateClientDto): Client {
    const { rawPhone, clientType, refreshToken, cards } = data;
    const phone: string = this.formatPhone(rawPhone);
    const name: string = this.generateDefaultName(phone);
    return new Client(
      name,
      rawPhone,
      phone,
      clientType,
      refreshToken,
      1,
      1,
      1,
      AvatarType.ONE,
      {
        cards,
      },
    );
  }

  public addCard(card: Card): void {
    if (!this.cards) this.cards = [];
    this.cards.push(card);
  }

  public getCard(): Card {
    let mainCard: Card;
    if (this.cards.length > 0) {
      mainCard = this.cards.reduce((prev: Card, curr: Card) => {
        return (prev.balance ?? 0) > (curr.balance ?? 0) ? prev : curr;
      });
    } else {
      mainCard = this.cards[0];
    }

    return mainCard;
  }

  public isClientActive(): boolean {
    if (this.isActivated == 1) {
      return true;
    } else {
      return false;
    }
  }

  public getAccountInfo(meta?: OnviMeta): ShortClientDto {
    let mainCard: Card;
    if (this.cards.length > 0) {
      mainCard = this.cards.reduce((prev: Card, curr: Card) => {
        return (prev.balance ?? 0) > (curr.balance ?? 0) ? prev : curr;
      });
    } else {
      mainCard = this.cards[0];
    }

    return {
      id: this.clientId,
      name: this.name,
      phone: this.correctPhone,
      email: this.email,
      birthday: this.birthday,
      refreshToken: this.refreshToken,
      avatar: this.avatarOnvi,
      isNotifications: this.isNotifications,
      cards: {
        number: mainCard.nomer,
        unqNumber: mainCard.devNomer,
        balance: mainCard.balance,
        isLocked: mainCard.isLocked,
        dateBegin: mainCard.dateBegin,
      },
      meta: meta ? meta : null,
    };
  }

  private static generateDefaultName(correctPhone: string): string {
    return `Onvi ${correctPhone}`;
  }
  private static formatPhone(rawPhone: string): string {
    return rawPhone.replace(/^\s*\+|\s*/g, '');
  }

  public static fromEntity(entity: ClientEntity): Client {
    let cardModels;
    const {
      clientId,
      name,
      email,
      phone,
      correctPhone,
      birthday,
      insDate,
      updDate,
      clientTypeId,
      isActivated,
      userOnvi,
      isNotifications,
      avatarOnvi,
      activatedDate,
      genderId,
      refreshToken,
      cards,
    } = entity;

    if (cards) {
      cardModels = cards.map((cardEntity: CardEntity) =>
        Card.fromEntity(cardEntity),
      );
    }
    const client = new Client(
      name,
      phone,
      correctPhone,
      clientTypeId,
      refreshToken,
      isActivated,
      userOnvi,
      isNotifications,
      avatarOnvi,
      {
        clientId,
        email,
        birthday,
        insDate,
        updDate,
        activationDate: activatedDate,
        genderId,
        cards: cardModels,
      },
    );
    return client;
  }
}
