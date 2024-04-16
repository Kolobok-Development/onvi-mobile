import { Card } from '../../card/model/card';
import { GenderType } from '../enum/gender.enum';
import { ClientType } from '../enum/clinet-type.enum';
import { ICreateClientDto } from '../dto/create-client.dto';
import { ActivationStatusType } from '../enum/activation-status.enum';
import { ClientEntity } from '../../../../infrastructure/account/entity/client.entity';
import { CardEntity } from '../../../../infrastructure/account/entity/card.entity';
import { ShortClientDto } from '../dto/short-client.dto';

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
  isActivated?: number;
  userOnvi: number;
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
    userOnvi: number,
    {
      clientId,
      email,
      birthday,
      cards,
      insDate,
      updDate,
      isActivated,
      activationDate,
      genderId,
    }: {
      clientId?: number;
      email?: string;
      birthday?: Date;
      cards?: Card[];
      insDate?: Date;
      updDate?: Date;
      isActivated?: ActivationStatusType;
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
    this.activatedDate = activationDate;
    this.genderId = genderId;
    this.clientId = clientId;
  }

  public static create(data: ICreateClientDto): Client {
    const { rawPhone, clientType, refreshToken, cards } = data;
    const phone: string = this.formatPhone(rawPhone);
    const name: string = this.generateDefaultName(phone);
    return new Client(name, rawPhone, phone, clientType, refreshToken, 1, {
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
      cards: {
        number: mainCard.nomer,
        unqNumber: mainCard.devNomer,
        balance: mainCard.balance,
        isLocked: mainCard.isLocked,
        dateBegin: mainCard.dateBegin,
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
      userOnvi,
      {
        clientId,
        email,
        birthday,
        insDate,
        updDate,
        isActivated,
        activationDate: activatedDate,
        genderId,
        cards: cardModels,
      },
    );
    return client;
  }
}
