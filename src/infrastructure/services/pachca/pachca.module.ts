import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PachcaService } from './pachca.service';
import { EnvConfigModule } from '../../config/env-config/env-config.module';

@Module({
  imports: [HttpModule, EnvConfigModule],
  providers: [PachcaService],
  exports: [PachcaService],
})
export class PachcaModule {}

