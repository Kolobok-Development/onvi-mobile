import { CardHistEntity } from '../../../../infrastructure/account/entity/card-hist.enity';

export class CardHist {
  transactionId?: number;
  operDate: Date;
  sum: number;
  carWash: string;
  city: string;

  constructor(
    operDate: Date,
    sum: number,
    carWash: string,
    city: string,
    transactionId?: number,
  ) {
    this.operDate = operDate;
    this.sum = sum;
    this.carWash = carWash;
    this.city = city;
    this.transactionId = transactionId;
  }

  public static fromEntity(cardHistEntity: CardHistEntity): CardHist {
    const { operId, operDate, operSum, cwName, ctName } = cardHistEntity;

    return new CardHist(operDate, operSum, cwName, ctName, operId);
  }
}
