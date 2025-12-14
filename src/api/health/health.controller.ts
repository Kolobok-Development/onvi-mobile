import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller()
export class HealthController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  health() {
    return {
      status: 'ok',
      service: 'onvi-mobile-api',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  async healthCheck() {
    const startTime = Date.now();
    let dbStatus = 'unknown';
    let dbLatency = null;

    try {
      // Quick database connectivity check
      await this.dataSource.query('SELECT 1 FROM DUAL');
      dbStatus = 'connected';
      dbLatency = Date.now() - startTime;
    } catch (error) {
      dbStatus = 'error';
      dbLatency = Date.now() - startTime;
    }

    return {
      status: dbStatus === 'connected' ? 'ok' : 'degraded',
      service: 'onvi-mobile-api',
      database: {
        status: dbStatus,
        latency: dbLatency ? `${dbLatency}ms` : null,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
