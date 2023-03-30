import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardEntity } from './entity/card.entity';
import { ClientEntity } from './entity/client.entity';
import { AccountRepositoryProvider } from './account-repository.provider';

@Module({
  imports: [TypeOrmModule.forFeature([CardEntity, ClientEntity])],
  providers: [AccountRepositoryProvider],
  exports: [AccountRepositoryProvider],
})
export class AccountRespositoryModule {}
