import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromoCodeEntity } from './enitity/promocode.entity';
import { PromoCodeUsageEntity } from './enitity/promo-code-usage.entity';
import { PromoCodeLocationEntity } from './enitity/promo-code-location.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PromoCodeEntity,
      PromoCodeUsageEntity,
      PromoCodeLocationEntity,
    ]),
  ],
  providers: [],
  exports: [],
})
export class PromocodeModule {}
