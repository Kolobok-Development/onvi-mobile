import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'PHONE_CODE', synchronize: false })
export class OtpEntity {
  @PrimaryGeneratedColumn({ name: 'ID', type: 'number' })
  id: number;

  @Column({ name: 'PHONE_NUMBER', type: 'varchar2' })
  phone: string;

  @Column({ name: 'CONFIRM_CODE', type: 'varchar2' })
  otp: string;

  @Column({ name: 'CREATE_DATE', type: 'date' })
  createDate: Date;

  @Column({ name: 'EXPIRE_DATE', type: 'date' })
  expireDate: Date;
}
