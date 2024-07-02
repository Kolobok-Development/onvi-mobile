import { Card } from '../../card/model/card';
import { GenderType } from '../enum/gender.enum';
import { ClientType } from '../enum/clinet-type.enum';
import { ICreateClientDto } from '../dto/create-client.dto';
import { ClientEntity } from '../../../../infrastructure/account/entity/client.entity';
import { CardEntity } from '../../../../infrastructure/account/entity/card.entity';
import { ShortClientDto } from '../dto/short-client.dto';
import {AvatarType} from "../enum/avatar.enum";
import {OnviMeta} from "./onviMeta";
import {MetadataEntity} from "../../../../infrastructure/account/entity/metadata.entity";

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
  avatarOnvi: AvatarType;
  activatedDate?: Date;
  genderId?: GenderType;
  refreshToken?: string;
  cards?: Card[];
  meta?: OnviMeta;
  authToken?: string;
  isNotifications: number;

  private constructor(
    name: string,
    rawPhone: string,
    phone: string,
    clientType: ClientType,
    refreshToken: string,
    isActivated: number,
    userOnvi: number,
    avatarOnvi: AvatarType,
    isNotifications: number,
    {
      clientId,
      email,
      birthday,
      cards,
      meta,
      insDate,
      updDate,
      activationDate,
      genderId,
      authToken,
    }: {
      clientId?: number;
      email?: string;
      birthday?: Date;
      cards?: Card[];
      meta?: OnviMeta;
      insDate?: Date;
      updDate?: Date;
      activationDate?: Date;
      genderId?: GenderType;
      authToken?: string;
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
    this.meta = meta;
    this.insDate = insDate;
    this.updDate = updDate;
    this.isActivated = isActivated;
    this.userOnvi = userOnvi;
    this.avatarOnvi = avatarOnvi;
    this.activatedDate = activationDate;
    this.genderId = genderId;
    this.clientId = clientId;
    this.authToken = authToken;
    this.isNotifications = isNotifications;
  }

  public static create(data: ICreateClientDto): Client {
    const { rawPhone, clientType, refreshToken, cards } = data;
    const phone: string = this.formatPhone(rawPhone);
    const name: string = this.generateDefaultName(phone);
    return new Client(name, rawPhone, phone, clientType, refreshToken, 1, 1, AvatarType.ONE,1,{
      cards,
    });
  }

  public addCard(card: Card): void {
    if (!this.cards) this.cards = [];
    this.cards.push(card);
  }

  public getCard(): Card {
    let mainCard: Card;
    if (this.cards.length > 0) {
      const activeCards: Card[] = this.cards.filter(
        (card) => card.isDel === null || card.isDel === 0,
      );
      mainCard = activeCards.reduce((prev: Card, curr: Card) => {
        return (prev.balance ?? 0) > (curr.balance ?? 0) ? prev : curr;
      });
    } else {
      mainCard = this.cards[0];
    }

    return mainCard;
  }

  public getAccountInfo(): ShortClientDto {
    let mainCard: Card;
    if (this.cards.length > 0) {
      const activeCards: Card[] = this.cards.filter(
        (card) => card.isDel === null || card.isDel === 0,
      );
      mainCard = activeCards.reduce((prev: Card, curr: Card) => {
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
      authToken: this.authToken,
      isNotification: this.isNotifications,
      cards: {
        number: mainCard.nomer,
        unqNumber: mainCard.devNomer,
        balance: mainCard.balance,
        isLocked: mainCard.isLocked,
        dateBegin: mainCard.dateBegin,
      },
      meta: {
        deviceId: this.meta.deviceId,
        model: this.meta.model,
        name: this.meta.name,
        platform: this.meta.platform,
        platformVersion: this.meta.platformVersion,
        manufacturer: this.meta.manufacturer,
        appToken: this.meta.appToken,
        isEmulator: this.meta.isEmulator,
        mac: this.meta.mac,
      },
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
    let metaModels;
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
      avatarOnvi,
      activatedDate,
      genderId,
      refreshToken,
      cards,
      meta,
      authToken,
      isNotifications,
    } = entity;

    if (cards) {
      cardModels = cards.map((cardEntity: CardEntity) =>
        Card.fromEntity(cardEntity),
      );
    }
    if (meta) {
      metaModels = OnviMeta.fromEntity(meta);
    }
    const client = new Client(
      name,
      phone,
      correctPhone,
      clientTypeId,
      refreshToken,
      isActivated,
      userOnvi,
      avatarOnvi,
      isNotifications,
      {
        clientId,
        email,
        birthday,
        insDate,
        updDate,
        activationDate: activatedDate,
        genderId,
        cards: cardModels,
        meta: metaModels,
        authToken,
      },
    );
    return client;
  }
}
