import { Card } from '../../card/model/card';
import { GenderType } from '../enum/gender.enum';
import { ClientType } from '../enum/clinet-type.enum';
import { ICreateClientDto } from '../../../dto/account-create-client.dto';
import { ActivationStatusType } from '../enum/activation-status.enum';
import { ClientEntity } from '../../../../infrastructure/account/entity/client.entity';
import { CardEntity } from '../../../../infrastructure/account/entity/card.entity';
import { AccountShortClientDto } from '../../../dto/account-short-client.dto';
import { AvatarType } from '../enum/avatar.enum';
import {OnviMeta} from "./onviMeta";
import {CardMapper} from "../../../../infrastructure/account/mapper/card.mapper";

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

  constructor(
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

  public getAccountInfo(meta?: OnviMeta): AccountShortClientDto {
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
}
