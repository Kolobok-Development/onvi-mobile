import { Client } from '../../client/model/client';
import { CardType } from '../enum/card-type.enum';
import { ICreateCardDto } from '../../../dto/account-create-card.dto';
import { CardEntity } from '../../../../infrastructure/account/entity/card.entity';

export class Card {
  cardId?: number;
  balance: number;
  isLocked?: number;
  dateBegin: Date;
  dateEnd?: Date;
  clientId?: number;
  cardTypeId: CardType;
  devNomer: string;
  isDel?: number;
  cmnCity?: number;
  realBalance: number;
  airBalance: number;
  nomer: string;
  tag?: string;

  constructor(
    cardTypeId: CardType,
    nomer: string,
    devNomer: string,
    balance: number,
    airBalance: number,
    realBalance: number,
    dateBegin: Date,
    {
      cardId,
      isLocked,
      dateEnd,
      isDel,
      cmnCity,
      tag,
      clientId,
    }: {
      cardId?: number;
      isLocked?: number;
      dateEnd?: Date;
      isDel?: number;
      cmnCity?: number;
      tag?: string;
      clientId?: number;
    },
  ) {
    this.cardId = cardId;
    this.clientId = clientId;
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
    this.tag = tag;
  }

  public static create(data: ICreateCardDto): Card {
    const { clientId, nomer, devNomer, cardTypeId, beginDate } = data;
    const balance = 0;
    const airBalance = 0;
    const realBalance = 0;
    return new Card(
      cardTypeId,
      nomer,
      devNomer,
      balance,
      airBalance,
      realBalance,
      beginDate,
      { clientId },
    );
  }

  public isCardActive(): boolean {
    return this.isDel === null || this.isDel === 0;
  }
}
