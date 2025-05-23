import { CardHistEntity } from '../../../../infrastructure/account/entity/card-hist.enity';
import {OrderStatus} from "../../../order/enum/order-status.enum";
import {DeviceType} from "../../../order/enum/device-type.enum";

export class CardHist {
  unqCardNumber: string;
  name: string;
  phone: string;
  operDate: Date;
  operSum: number;
  operSumReal: number;
  operSumPoint: number;
  orderStatus: OrderStatus;
  cashBackAmount: number;
  carWash: string;
  bay: string;
  bayType: DeviceType;
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
    orderStatus: OrderStatus,
    cashBackAmount: number,
    carWash: string,
    bay: string,
    bayType: DeviceType,
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
    this.orderStatus = orderStatus;
    this.cashBackAmount = cashBackAmount;
    this.carWash = carWash;
    this.bay = bay;
    this.bayType = bayType;
    this.address = address;
    this.city = city;
  }
}
