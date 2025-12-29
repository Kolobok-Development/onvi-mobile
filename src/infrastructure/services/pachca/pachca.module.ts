import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PachcaService } from './pachca.service';
import { EnvConfigModule } from '../../config/env-config/env-config.module';
import { INotificationService } from '../../../domain/health/adapter/notification-service.interface';

@Module({
  imports: [HttpModule, EnvConfigModule],
  providers: [
    {
      provide: INotificationService,
      useClass: PachcaService,
    },
  ],
  exports: [INotificationService],
})
export class PachcaModule {}

