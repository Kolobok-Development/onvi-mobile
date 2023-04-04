import { Provider } from '@nestjs/common';
import { DateService } from './date.service';

export const DateServiceProvider: Provider = {
  provide: 'DateService',
  useClass: DateService,
};
