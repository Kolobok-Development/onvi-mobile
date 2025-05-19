import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardEntity } from './entity/card.entity';
import { ClientEntity } from './entity/client.entity';
import { ClientRepository } from './repository/client.repository';
import { CardRepository } from './repository/card.repository';
import { AccountController } from '../../api/account/account.controller';
import { CardHistEntity } from './entity/card-hist.enity';
import { DateModule } from '../services/date/date.module';
import { TariffEntity } from './entity/tariff.entity';
import { PromotionHistEntity } from '../promotion/entity/promotion-hist.entity';
import { MetadataEntity } from './entity/metadata.entity';
import { MetaRepositoryProvider } from './provider/meta-repository.provider';
import { PromoCodeToUserEntity } from '../promo-code/entity/promo-code-to-user.entity';
import { PromocodeModule } from '../promo-code/promocode.module';
import { CardHistoryRepositoryProvider } from './provider/cardHistory-repository.provider';
import { TariffRepositoryProvider } from './provider/tariff-repository.provider';
import { PromotionHistoryRepositoryProvider } from '../promotion/provider/promotionHistory-repository.provider';
import { ClientRepositoryProvider } from './provider/client-repository.provider';
import { CardRepositoryProvider } from './provider/card-repository.provider';
import { CreateMetaUseCase } from '../../application/usecases/account/account-meta-create';
import { UpdateMetaUseCase } from '../../application/usecases/account/account-meta-update';
import { FindMethodsMetaUseCase } from '../../application/usecases/account/account-meta-find-methods';
import { UpdateClientUseCase } from '../../application/usecases/account/account-client-update';
import { CardService } from '../../application/services/card-service';
import { DeleteAccountUseCase } from '../../application/usecases/account/account-delete';
import { FindMethodsCardUseCase } from '../../application/usecases/account/account-card-find-methods';
import { AccountTransferUseCase } from '../../application/usecases/account/account-transfer';
import { TransactionModule } from '../transaction/transaction.module';
import { BalanceWsModule } from '../../websockets/balance/balance-ws.module';

const repositories: Provider[] = [
  ClientRepositoryProvider,
  CardRepositoryProvider,
  CardHistoryRepositoryProvider,
  TariffRepositoryProvider,
  MetaRepositoryProvider,
];
const metaUseCase: Provider[] = [
  CreateMetaUseCase,
  UpdateMetaUseCase,
  FindMethodsMetaUseCase,
];
const clientUseCase: Provider[] = [UpdateClientUseCase];
const cardUseCase: Provider[] = [CardService, FindMethodsCardUseCase];
const accountUseCase: Provider[] = [
  DeleteAccountUseCase,
  AccountTransferUseCase,
];
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CardEntity,
      ClientEntity,
      CardHistEntity,
      PromoCodeToUserEntity,
      TariffEntity,
      MetadataEntity,
    ]),
    DateModule,
    PromocodeModule,
    TransactionModule,
  ],
  controllers: [AccountController],
  providers: [
    ...repositories,
    ...metaUseCase,
    ...clientUseCase,
    ...cardUseCase,
    ...accountUseCase,
  ],
  exports: [...repositories, ...metaUseCase, ...cardUseCase],
})
export class AccountModule {}
