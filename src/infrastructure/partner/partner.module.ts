import { Module } from '@nestjs/common';
import { GazpromRepositoryProvider } from './gazprom/provider/gazprom-repository.provider';
import { GazpromRepository } from './gazprom/repository/gazprom.repository';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnerEntity } from './entity/partner.entity';
import { PartnerClientEntity } from './entity/partner-client.entity';
import { PartnerRepositoryProvider } from './provider/partner-repository.provider';
import { EnvConfigModule } from '../config/env-config/env-config.module';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([PartnerEntity, PartnerClientEntity]),
    EnvConfigModule,
  ],
  controllers: [],
  providers: [
    GazpromRepositoryProvider,
    PartnerRepositoryProvider,
    GazpromRepository,
  ],
  exports: [
    GazpromRepositoryProvider,
    PartnerRepositoryProvider,
  ],
})
export class PartnerModule {}
