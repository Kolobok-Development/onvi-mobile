import { Module } from '@nestjs/common';
import { DateServiceProvider } from './date.provider';
import { DateService } from './date.service';

@Module({
  imports: [],
  providers: [DateServiceProvider],
  exports: [DateServiceProvider],
})
export class DateModule {}
