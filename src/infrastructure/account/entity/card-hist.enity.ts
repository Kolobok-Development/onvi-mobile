import {Column, ViewColumn, ViewEntity} from 'typeorm';
import { Exclude } from 'class-transformer';
import {DeviceType} from "../../../domain/order/enum/device-type.enum";

@ViewEntity({
  expression: 'select * from ONVI_MOBILE_ORDER_HIST',
  name: 'ONVI_MOBILE_ORDER_HIST',
})
export class CardHistEntity {

  @ViewColumn({ name: 'UNQCARD_NUMBER' })
  unqCardNumber: string;

  @ViewColumn({ name: 'NAME' })
  name: string;

  @ViewColumn({ name: 'PHONE' })
  phone: string;

  @ViewColumn({ name: 'OPER_DATE' })
  operDate: Date;

  @ViewColumn({ name: 'OPER_SUM' })
  operSum: number;

  @ViewColumn({ name: 'OPER_SUM_REAL' })
  operSumReal: number;

  @ViewColumn({ name: 'OPER_SUM_POINT' })
  operSumPoint: number;

  @ViewColumn({ name: 'CASHBACK_AMOUNT' })
  cashBackAmount: number;

  @ViewColumn({ name: 'ORDER_STATUS' })
  orderStatus: string;

  @ViewColumn({ name: 'CAR_WASH' })
  carWash: string;

  @ViewColumn({ name: 'BAY' })
  bay: string;

  @ViewColumn({ name: 'BAY_TYPE' })
  bayType: DeviceType;

  @ViewColumn({ name: 'ADDRESS' })
  address: string;

  @ViewColumn({ name: 'CITY' })
  city: string;
}
