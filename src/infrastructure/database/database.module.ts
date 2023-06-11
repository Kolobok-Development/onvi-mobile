import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OtpEntity } from '../otp/entity/otp.entity';
import { ClientEntity } from '../account/entity/client.entity';
import { CardEntity } from '../account/entity/card.entity';
import { CardHistEntity } from '../account/entity/card-hist.enity';
import { OrderEntity } from '../order/entity/order.entity';
import { PromoCodeEntity } from '../promo-code/enitity/promocode.entity';
import { PromoCodeLocationEntity } from '../promo-code/enitity/promo-code-location.entity';
import { PromoCodeUsageEntity } from '../promo-code/enitity/promo-code-usage.entity';

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
          OrderEntity,
          PromoCodeEntity,
          PromoCodeLocationEntity,
          PromoCodeUsageEntity,
        ],
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
