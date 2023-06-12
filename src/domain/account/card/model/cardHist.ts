import { CardHistEntity } from '../../../../infrastructure/account/entity/card-hist.enity';

export class CardHist {
  cardId: number;
  unqCardNumber: string;
  name: string;
  phone: string;
  operDate: Date;
  operSum: number;
  cashBackAmount: number;
  operType: string;
  carWash: string;
  bay: string;
  address: string;
  city: string;

  constructor(
    cardId: number,
    unqCardNumber: string,
    name: string,
    phone: string,
    operDate: Date,
    operSum: number,
    cashBackAmount: number,
    operType: string,
    carWash: string,
    bay: string,
    address: string,
    city: string,
  ) {
    this.cardId = cardId;
    this.unqCardNumber = unqCardNumber;
    this.name = name;
    this.phone = phone;
    this.operDate = operDate;
    this.operSum = operSum;
    this.cashBackAmount = cashBackAmount;
    this.operType = operType;
    this.carWash = carWash;
    this.bay = bay;
    this.address = address;
    this.city = city;
  }

  public static fromEntity(cardHistEntity: CardHistEntity): CardHist {
    const {
      cardId,
      unqCardNumber,
      name,
      phone,
      operDate,
      operSum,
      cashBackAmount,
      operType,
      carWash,
      address,
      city,
      bay,
    } = cardHistEntity;

    return new CardHist(
      cardId,
      unqCardNumber,
      name,
      phone,
      operDate,
      operSum,
      cashBackAmount,
      operType,
      carWash,
      bay,
      address,
      city,
    );
  }
}
