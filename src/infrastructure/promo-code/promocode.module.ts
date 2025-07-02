import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromoCodeEntity } from './entity/promocode.entity';
import { PromoCodeUsageEntity } from './entity/promo-code-usage.entity';
import { PromoCodeLocationEntity } from './entity/promo-code-location.entity';
import { PromoCodeRepositoryProvider } from './provider/promo-code-repository.provider';
import { PromoCodeToUserEntity } from './entity/promo-code-to-user.entity';
import { PromocodeUsecase } from '../../application/usecases/promocode/promocode.usecase';
import { PromoCodeService } from '../../application/services/promocode-service';
import { GeocodingModule } from '../services/geocoding/geocoding.module';
import { CmnCityEntity } from '../cmn-city/entity/cmn-city.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PromoCodeEntity,
      PromoCodeUsageEntity,
      PromoCodeLocationEntity,
      PromoCodeToUserEntity,
      CmnCityEntity,
    ]),
    GeocodingModule,
  ],
  providers: [PromoCodeRepositoryProvider, PromocodeUsecase, PromoCodeService],
  exports: [PromoCodeRepositoryProvider, PromocodeUsecase, PromoCodeService],
})
export class PromocodeModule {}
