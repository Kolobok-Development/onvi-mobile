import {Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn} from 'typeorm';
import { CardEntity } from './card.entity';
import {AvatarType} from "../../../domain/account/client/enum/avatar.enum";
import {MetadataEntity} from "./metadata.entity";

@Entity({ name: 'CRDCLIENT', synchronize: false })
export class ClientEntity {
  @PrimaryGeneratedColumn({ name: 'CLIENT_ID', type: 'number' })
  clientId: number;

  @Column({ name: 'NAME', type: 'nvarchar2' })
  name: string;

  @Column({ name: 'INN', type: 'nvarchar2' })
  inn: string;

  @Column({ name: 'EMAIL', type: 'nvarchar2' })
  email: string;

  @Column({ name: 'PHONE', type: 'nvarchar2' })
  phone: string;

  @Column({ name: 'BIRTHDAY', type: 'date' })
  birthday: Date;

  @Column({ name: 'INS_DATE', type: 'date' })
  insDate: Date;

  @Column({ name: 'UPD_DATE', type: 'date' })
  updDate: Date;

  @Column({ name: 'INS_USER_ID', type: 'number' })
  insUserId: number;

  @Column({ name: 'UPD_USER_ID', type: 'number' })
  updUserId: number;

  @Column({ name: 'CLIENT_TYPE_ID', type: 'number' })
  clientTypeId: number;

  @Column({ name: 'NOTE', type: 'clob' })
  note: string;

  @Column({ name: 'AVTO', type: 'varchar2' })
  avto: string;

  @Column({ name: 'IS_ACTIVATED', type: 'number' })
  isActivated: number;

  @Column({ name: 'DISCOUNT', type: 'number' })
  discount: number;

  @Column({ name: 'GENDER_ID', type: 'number' })
  genderId: number;

  @Column({ name: 'CORRECT_PHONE', type: 'varchar2' })
  correctPhone: string;

  @Column({ name: 'REFRESH_TOKEN', type: 'varchar2' })
  refreshToken: string;

  @Column({ name: 'TOKEN_ID', type: 'varchar2' })
  tokenId: string;

  @Column({ name: 'IS_TOKEN_VALID', type: 'varchar2' })
  isTokeValid: string;

  @Column({ name: 'ACTIVATED_DATE', type: 'date' })
  activatedDate: Date;

  @Column({ name: 'IS_ACTIVATED_LIGHT', type: 'number' })
  isActiveLight: number;

  @Column({ name: 'ACTIVATED_DATE_LIGHT', type: 'date' })
  activatedDateLight: Date;

  @Column({ name: 'IS_LK', type: 'number' })
  isLk: number;

  @Column({ name: 'TAG', type: 'varchar2' })
  tag: string;

  @Column({ name: 'USER_ONVI', type: 'number' })
  userOnvi: number;

  @Column({ name: 'AVATAR_ONVI', type: 'varchar2'})
  avatarOnvi: AvatarType;

  @Column({ name: 'AUTH_TOKEN', type: 'varchar2'})
  authToken: string;

  @Column({ name: 'IS_NOTIFICATIONS', type: 'number'})
  isNotifications: number;

  @OneToMany(() => CardEntity, (card: CardEntity) => card.client)
  cards: CardEntity[];

  @OneToOne(() => MetadataEntity, (meta: MetadataEntity) => meta.client)
  meta: MetadataEntity;
}
