import { Module } from '@nestjs/common';
import { HealthCheckRepository } from './health-check.repository';
import { IHealthCheckRepository } from '../../../domain/health/adapter/health-check-repository.interface';
import { DatabaseModule } from '../../database/database.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    DatabaseModule,
    BullModule.registerQueue({
      name: 'pos-process',
    }),
  ],
  providers: [
    {
      provide: IHealthCheckRepository,
      useClass: HealthCheckRepository,
    },
  ],
  exports: [IHealthCheckRepository],
})
export class HealthModule {}

