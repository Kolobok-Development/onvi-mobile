import { Otp } from '../model/otp';

export abstract class IOtpRepository {
  abstract create(opt: Otp): Promise<any>;
  abstract findOne(phone: string): Promise<Otp>;
  abstract removeOne(phone: string): Promise<void>;
  abstract send(otp: Otp): Promise<any>;
  abstract getRecentAttempts(phone: string): Promise<number>;
  /** Last createDate (sent-at) for this phone, or null. Used for DB cooldown when Redis is down. */
  abstract getLastSentAt(phone: string): Promise<Date | null>;
}
