import { Module } from '@nestjs/common';
import { AccountRespositoryModule } from './account/account-respository.module';

@Module({
  imports: [AccountRespositoryModule],
  exports: [AccountRespositoryModule],
})
export class PersistenceModule {}
