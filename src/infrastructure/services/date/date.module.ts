import { Module } from '@nestjs/common';
import { DateServiceProvider } from './date.provider';

@Module({
  imports: [],
  providers: [DateServiceProvider],
  exports: [DateServiceProvider],
})
export class DateModule {}
