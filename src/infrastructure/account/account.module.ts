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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CardEntity,
      ClientEntity,
      CardHistEntity,
      PromotionHistEntity,
      TariffEntity,
    ]),
    DateModule,
  ],
  controllers: [AccountController],
  providers: [
    AccountRepositoryProvider,
    ClientRepository,
    CardRepository,
    AccountUsecase,
  ],
  exports: [AccountRepositoryProvider],
})
export class AccountModule {}
