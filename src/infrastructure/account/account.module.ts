import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardEntity } from './entity/card.entity';
import { ClientEntity } from './entity/client.entity';
import { AccountRepositoryProvider } from './provider/account-repository.provider';
import { ClientRepository } from './repository/client.repository';
import { CardRepository } from './repository/card.repository';
import { AccountController } from '../../api/account/account.controller';
import { CardHistEntity } from './entity/card-hist.enity';
import { AccountUsecase } from '../../application/usecases/account/account.usecase';
import { DateModule } from '../services/date/date.module';
import { TariffEntity } from './entity/tariff.entity';
import { PromotionHistEntity } from '../promotion/entity/promotion-hist.entity';
import {MetadataEntity} from "./entity/metadata.entity";
import {MetaRepository} from "./repository/meta.repository";
import {MetaRepositoryProvider} from "./provider/meta-repository.provider";
import {PromoCodeToUserEntity} from "../promo-code/entity/promo-code-to-user.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CardEntity,
      ClientEntity,
      CardHistEntity,
      PromotionHistEntity,
      PromoCodeToUserEntity,
      TariffEntity,
      MetadataEntity,
    ]),
    DateModule,
  ],
  controllers: [AccountController],
  providers: [
    AccountRepositoryProvider,
      MetaRepositoryProvider,
    ClientRepository,
    CardRepository,
    AccountUsecase,
  ],
  exports: [AccountRepositoryProvider, AccountUsecase],
})
export class AccountModule {}
