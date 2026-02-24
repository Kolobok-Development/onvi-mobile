import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import Redis from 'ioredis';
import { Inject, Optional } from '@nestjs/common';
import { CACHE_REDIS_CLIENT } from '../redis/cache-redis.module';
import { EnvConfigService } from '../config/env-config/env-config.service';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

interface SubnetBlockConfig {
  enabled: boolean;
  subnets: string[];
}

@Injectable()
export class SubnetBlockConfigService implements OnModuleInit, OnModuleDestroy {
  private config: SubnetBlockConfig = { enabled: false, subnets: [] };
  private s3: S3Client | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly env: EnvConfigService,
    @Optional()
    @Inject(CACHE_REDIS_CLIENT)
    private readonly redis: Redis | null,
  ) {}

  async onModuleInit() {
    this.initS3();
    await this.reload();
    const refreshSeconds = Math.max(
      5,
      this.env.getSubnetConfigRefreshSeconds(),
    );
    this.refreshTimer = setInterval(() => {
      void this.reload();
    }, refreshSeconds * 1000);
  }

  onModuleDestroy() {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    this.refreshTimer = null;
  }

  async reload(): Promise<void> {
    const fromS3 = await this.reloadFromS3();
    if (fromS3) return;

    const configPath =
      process.env.SUBNET_BLOCK_CONFIG_PATH ||
      path.join(process.cwd(), 'blocked-subnets.json');
    try {
      const raw = fs.readFileSync(configPath, 'utf-8');
      this.setConfigFromRaw(raw);
    } catch {
      this.config = { enabled: false, subnets: [] };
    }
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  getBlockedSubnets(): string[] {
    return [...this.config.subnets];
  }

  async registerOtpIpAndMaybeBan(ip: string): Promise<boolean> {
    if (!this.env.getOtpAutobanEnabled()) return false;
    if (!this.redis) return false;
    const normalizedIp = this.normalizeIp(ip);
    if (!normalizedIp) return false;
    const cidr = `${normalizedIp}/32`;
    if (this.config.subnets.includes(cidr)) return true;

    const key = `autoban:otp:ip:900:${normalizedIp}`;
    const threshold = Math.max(1, this.env.getOtpAutobanIpPer15M());
    try {
      const current = await this.redis.incr(key);
      if (current === 1) {
        await this.redis.expire(key, 900);
      }
      if (current < threshold) return false;

      this.config = {
        enabled: true,
        subnets: Array.from(new Set([...this.config.subnets, cidr])),
      };
      await this.persistToS3();
      return true;
    } catch {
      return false;
    }
  }

  private initS3(): void {
    const endpoint = this.env.getSubnetBlockS3Endpoint();
    const bucket = this.env.getSubnetBlockS3Bucket();
    const accessKeyId = this.env.getSubnetBlockS3AccessKeyId();
    const secretAccessKey = this.env.getSubnetBlockS3SecretAccessKey();
    if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) return;

    this.s3 = new S3Client({
      region: this.env.getSubnetBlockS3Region(),
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  private async reloadFromS3(): Promise<boolean> {
    if (!this.s3) return false;
    const bucket = this.env.getSubnetBlockS3Bucket();
    const key = this.env.getSubnetBlockS3Key();
    try {
      const response = await this.s3.send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: key,
        }),
      );
      const raw = await response.Body?.transformToString();
      if (!raw) return false;
      this.setConfigFromRaw(raw);
      return true;
    } catch {
      return false;
    }
  }

  private async persistToS3(): Promise<void> {
    if (!this.s3) return;
    const bucket = this.env.getSubnetBlockS3Bucket();
    const key = this.env.getSubnetBlockS3Key();
    await this.s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: 'application/json',
        Body: JSON.stringify(this.config, null, 2),
      }),
    );
  }

  private setConfigFromRaw(raw: string): void {
    const parsed = JSON.parse(raw) as SubnetBlockConfig;
    this.config = {
      enabled: Boolean(parsed.enabled),
      subnets: Array.isArray(parsed.subnets)
        ? parsed.subnets.filter((s) => typeof s === 'string' && s.trim())
        : [],
    };
  }

  private normalizeIp(ip: string): string {
    const v = (ip ?? '').trim();
    if (!v) return '';
    const ipv4 = v.startsWith('::ffff:') ? v.slice(7) : v;
    const parts = ipv4.split('.');
    if (parts.length !== 4) return '';
    if (parts.some((p) => !/^\d+$/.test(p) || Number(p) > 255)) return '';
    return ipv4;
  }
}
