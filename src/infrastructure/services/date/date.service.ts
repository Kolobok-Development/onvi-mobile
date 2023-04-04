import { Injectable } from '@nestjs/common';
import { IDate } from '../../common/interfaces/date.interface';
import * as moment from 'moment';

@Injectable()
export class DateService implements IDate {
  constructor() {}
  isExpired(timestamp: Date, expiryTime: number): boolean {
    const currentTime = moment();
    const diff = currentTime.diff(timestamp);
    return diff > expiryTime;
  }
}
