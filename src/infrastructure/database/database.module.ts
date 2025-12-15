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
          // Optimized for network issues (e.g., Russia -> AWS connectivity problems)
          poolMax: parseInt(configService.get('DB_POOL_MAX') || '20', 10), // Maximum connections in pool
          poolMin: parseInt(configService.get('DB_POOL_MIN') || '5', 10), // Minimum connections in pool (keep alive)
          poolIncrement: parseInt(
            configService.get('DB_POOL_INCREMENT') || '2',
            10,
          ), // Connections to add when pool grows
          queueTimeout: parseInt(
            configService.get('DB_QUEUE_TIMEOUT') || '10000',
            10,
          ), 
          poolTimeout: parseInt(
            configService.get('DB_POOL_TIMEOUT') || '300',
            10,
          ), // Seconds before idle connection is closed (5min to maintain connections)
          enableStatistics: false,
          // Connection retry and resilience settings for network issues
          connectString: `${configService.get('DB_HOST')}:${configService.get(
            'DB_PORT',
          )}/${configService.get('DB_SID')}`,
          // Keep connections alive to avoid reconnection overhead
          stmtCacheSize: 30,
          // Network timeout settings (important for Russia -> AWS connections)
          connectTimeout: parseInt(
            configService.get('DB_CONNECT_TIMEOUT') || '30000',
            10,
          ), // 30 seconds to establish connection
          // Query timeout to prevent long-running queries from holding connections
          // This is critical to prevent connection pool exhaustion
          queryTimeout: parseInt(
            configService.get('DB_QUERY_TIMEOUT') || '30000',
            10,
          ), // 30 seconds max query execution time
          // Enable connection retry on network errors (but limit retries to prevent storms)
          retryCount: parseInt(configService.get('DB_RETRY_COUNT') || '2', 10), // Reduced from 3 to 2
          retryDelay: parseInt(
            configService.get('DB_RETRY_DELAY') || '2000',
            10,
          ), // 2 seconds between retries (increased to prevent retry storms)
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
