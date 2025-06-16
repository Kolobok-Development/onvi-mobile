import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

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

  // These fields may require database migration
  @Column({ name: 'IP_ADDRESS', type: 'varchar2', nullable: true })
  ipAddress: string;

  @Column({ name: 'ATTEMPTS', type: 'number', default: 0 })
  attempts: number;

  // For tracking in the OTP tracker service
  get createdAt(): Date {
    return this.createDate;
  }
}
