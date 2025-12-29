export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  latency?: number;
  error?: string;
}

export abstract class IHealthCheckRepository {
  abstract checkDatabase(): Promise<HealthCheckResult>;
  abstract checkRedis(): Promise<HealthCheckResult>;
}

