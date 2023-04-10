import { Provider } from '@nestjs/common';
import { DateService } from './date.service';
import { IDate } from '../../common/interfaces/date.interface';

export const DateServiceProvider: Provider = {
  provide: IDate,
  useClass: DateService,
};
