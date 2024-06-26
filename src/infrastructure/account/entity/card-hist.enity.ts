import { ViewColumn, ViewEntity } from 'typeorm';
import { Exclude } from 'class-transformer';

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

  @ViewColumn({ name: 'CAR_WASH' })
  carWash: string;

  @ViewColumn({ name: 'BAY' })
  bay: string;

  @ViewColumn({ name: 'ADDRESS' })
  address: string;

  @ViewColumn({ name: 'CITY' })
  city: string;
}
