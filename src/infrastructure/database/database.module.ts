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
import {MetadataEntity} from "../account/entity/metadata.entity";

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
        ],
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
