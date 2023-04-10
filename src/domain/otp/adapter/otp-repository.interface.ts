import { Otp } from '../model/otp';

export abstract class IOtpRepository {
  abstract create(opt: Otp): Promise<any>;
  abstract findOne(phone: string): Promise<Otp>;
  abstract removeOne(phone: string): Promise<void>;
  abstract send(otp: Otp): Promise<any>;
}
