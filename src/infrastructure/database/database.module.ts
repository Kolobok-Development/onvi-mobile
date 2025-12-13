import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OtpEntity } from '../otp/entity/otp.entity';
import { ClientEntity } from '../account/entity/client.entity';
import { CardEntity } from '../account/entity/card.entity';
import { CardHistEntity } from '../account/entity/card-hist.enity';
import { OrderEntity } from '../order/entity/order.entity';
import { PromoCodeEntity } from '../promo-code/entity/promocode.entity';
import { PromoCodeLocationEntity } from '../promo-code/entity/promo-code-location.entity';
import { PromoCodeUsageEntity } from '../promo-code/entity/promo-code-usage.entity';
import { TariffEntity } from '../account/entity/tariff.entity';
import { PromotionEntity } from '../promotion/entity/promotion.entity';
import { PromotionUsageEntity } from '../promotion/entity/promotion-usage.entity';
import { PromotionHistEntity } from '../promotion/entity/promotion-hist.entity';
import { MetadataEntity } from '../account/entity/metadata.entity';
import { PromoCodeToUserEntity } from '../promo-code/entity/promo-code-to-user.entity';
import { PartnerEntity } from '../partner/entity/partner.entity';
import { PartnerClientEntity } from '../partner/entity/partner-client.entity';
import { CmnCityEntity } from '../cmn-city/entity/cmn-city.entity';
import { FavoritesEntity } from '../account/entity/favorites.entity';
import { RefundEntity } from '../payment/entity/refund.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'oracle',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        sid: configService.get('DB_SID'),
        synchronize: false,
        extra: {
          // Oracle connection pool configuration to prevent NJS-040 timeout errors
          // These settings control the oracledb driver's connection pool
          poolMax: parseInt(configService.get('DB_POOL_MAX') || '20', 10), // Maximum connections in pool (default: 4, increased to 20)
          poolMin: parseInt(configService.get('DB_POOL_MIN') || '5', 10), // Minimum connections in pool (default: 0, set to 5)
          poolIncrement: parseInt(configService.get('DB_POOL_INCREMENT') || '2', 10), // Connections to add when pool grows (default: 1)
          queueTimeout: parseInt(configService.get('DB_QUEUE_TIMEOUT') || '120000', 10), // Timeout for queued requests in ms (default: 60000, increased to 120s)
          poolTimeout: parseInt(configService.get('DB_POOL_TIMEOUT') || '60', 10), // Seconds before idle connection is closed
          enableStatistics: false,
        },
        entities: [
          ClientEntity,
          CardEntity,
          OtpEntity,
          CardHistEntity,
          PromotionHistEntity,
          OrderEntity,
          PromoCodeEntity,
          PromoCodeLocationEntity,
          PromoCodeUsageEntity,
          PromotionEntity,
          PromotionUsageEntity,
          TariffEntity,
          MetadataEntity,
          PromoCodeToUserEntity,
          PartnerEntity,
          PartnerClientEntity,
          CmnCityEntity,
          FavoritesEntity,
          RefundEntity,
        ],
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
