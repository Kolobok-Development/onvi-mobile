import { ViewColumn, ViewEntity } from 'typeorm';
import { Exclude } from 'class-transformer';

@ViewEntity({
  expression: 'select * from V_MAIN_CARD_OPER',
  name: 'V_MAIN_CARD_OPER',
})
export class CardHistEntity {
  @ViewColumn({ name: 'OPER_ID' })
  operId: number;

  @Exclude()
  @ViewColumn({ name: 'CARD_ID' })
  cardId: number;

  @Exclude()
  @ViewColumn({ name: 'DEV_NOMER' })
  devNomer: string;

  @ViewColumn({ name: 'NOMER' })
  nomer: string;

  @ViewColumn({ name: 'OPER_DATE' })
  operDate: Date;

  @ViewColumn({ name: 'OPER_COMMENT' })
  operComment: string;

  @Exclude()
  @ViewColumn({ name: 'OPER_TYPE_ID' })
  operTypeId: number;

  @Exclude()
  @ViewColumn({ name: 'TYPE_CODE' })
  typeCode: string;

  @ViewColumn({ name: 'TYPE_NAME' })
  typeName: string;

  @ViewColumn({ name: 'OPER_SUM' })
  operSum: number;

  @Exclude()
  @ViewColumn({ name: 'FIO' })
  fio: string;

  @Exclude()
  @ViewColumn({ name: 'USER_LOGIN' })
  userLogin: string;

  @Exclude()
  @ViewColumn({ name: 'CMNUSER_ID' })
  cmnuserId: number;

  @Exclude()
  @ViewColumn({ name: 'IS_DONE' })
  done: boolean;

  @Exclude()
  @ViewColumn({ name: 'INFO' })
  info: string;

  @Exclude()
  @ViewColumn({ name: 'CMNDEVICE_ID' })
  cmndeviceId: number;

  @Exclude()
  @ViewColumn({ name: 'LOCAL_ID' })
  localId: number;

  @Exclude()
  @ViewColumn({ name: 'LOAD_DATE' })
  loadDate: Date;

  @Exclude()
  @ViewColumn({ name: 'OPER_BALANCE' })
  operBalance: number;

  @Exclude()
  @ViewColumn({ name: 'CMNCITY_ID' })
  cmncityId: number;

  @Exclude()
  @ViewColumn({ name: 'CT_NAME' })
  ctName: string;

  @Exclude()
  @ViewColumn({ name: 'CMNCARWASH_ID' })
  cmncarwashId: number;

  @ViewColumn({ name: 'CW_NAME' })
  cwName: string;

  @ViewColumn({ name: 'DEV_NAME' })
  devName: string;
}
