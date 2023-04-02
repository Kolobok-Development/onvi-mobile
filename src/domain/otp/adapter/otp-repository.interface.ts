import { Otp } from '../model/otp';

export interface IOtpRepository {
  create(opt: Otp): Promise<any>;
  findOne(phone: string): Promise<Otp>;
  removeOne(phone: string): Promise<void>;
  send(otp: Otp): Promise<any>;
}
