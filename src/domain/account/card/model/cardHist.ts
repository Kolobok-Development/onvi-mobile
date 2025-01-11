import { CardHistEntity } from '../../../../infrastructure/account/entity/card-hist.enity';

export class CardHist {
  unqCardNumber: string;
  name: string;
  phone: string;
  operDate: Date;
  operSum: number;
  operSumReal: number;
  operSumPoint: number;
  cashBackAmount: number;
  carWash: string;
  bay: string;
  address: string;
  city: string;

  constructor(
    unqCardNumber: string,
    name: string,
    phone: string,
    operDate: Date,
    operSum: number,
    operSumReal: number,
    operSumPoint: number,
    cashBackAmount: number,
    carWash: string,
    bay: string,
    address: string,
    city: string,
  ) {
    this.unqCardNumber = unqCardNumber;
    this.name = name;
    this.phone = phone;
    this.operDate = operDate;
    this.operSum = operSum;
    this.operSumReal = operSumReal;
    this.operSumPoint = operSumPoint;
    this.cashBackAmount = cashBackAmount;
    this.carWash = carWash;
    this.bay = bay;
    this.address = address;
    this.city = city;
  }
}
