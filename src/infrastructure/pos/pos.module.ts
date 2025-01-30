import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PosServiceProvider } from './provider/pos.provider';
import { EnvConfigModule } from '../config/env-config/env-config.module';

@Module({
  imports: [HttpModule, EnvConfigModule],
  providers: [PosServiceProvider],
  exports: [PosServiceProvider],
})
export class PosModule {}
