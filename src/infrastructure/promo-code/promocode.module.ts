import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromoCodeEntity } from './entity/promocode.entity';
import { PromoCodeUsageEntity } from './entity/promo-code-usage.entity';
import { PromoCodeLocationEntity } from './entity/promo-code-location.entity';
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
