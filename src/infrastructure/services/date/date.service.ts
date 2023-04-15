import { Injectable } from '@nestjs/common';
import { IDate } from '../../common/interfaces/date.interface';
import * as moment from 'moment';
import { OTP_TIME } from '../../common/constants/constants';

@Injectable()
export class DateService implements IDate {
  constructor() {}
  isExpired(timestamp: Date, expiryTime: number): boolean {
    const currentTime = moment();
    const diff = currentTime.diff(timestamp);
    return diff > expiryTime;
  }
  generateOtpTime(): Date {
    const currentDateTime = moment();
    const futureDateTime = currentDateTime.add(OTP_TIME, 'minutes');

    return futureDateTime.toDate();
  }
}
