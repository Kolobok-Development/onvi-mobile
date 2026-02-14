import { Injectable, Inject } from '@nestjs/common';
import {
  IHealthCheckRepository,
  HealthCheckResult,
} from '../../../domain/health/adapter/health-check-repository.interface';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class HealthCheckRepository implements IHealthCheckRepository {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectQueue('pos-process')
    private readonly posProcessQueue: Queue,
  ) {}

  async checkDatabase(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    try {
      await this.dataSource.query('SELECT 1 FROM DUAL');
      const latency = Date.now() - startTime;
      return {
        status: 'healthy',
        latency,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async checkRedis(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    try {
      const client = await this.posProcessQueue.client;
      await client.ping();
      const latency = Date.now() - startTime;
      return {
        status: 'healthy',
        latency,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
