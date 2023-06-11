import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromoCodeEntity } from './enitity/promocode.entity';
import { PromoCodeUsageEntity } from './enitity/promo-code-usage.entity';
import { PromoCodeLocationEntity } from './enitity/promo-code-location.entity';
import { PromoCodeRepositoryProvider } from './provider/promo-code-repository.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PromoCodeEntity,
      PromoCodeUsageEntity,
      PromoCodeLocationEntity,
    ]),
  ],
  providers: [PromoCodeRepositoryProvider],
  exports: [PromoCodeRepositoryProvider],
})
export class PromocodeModule {}
