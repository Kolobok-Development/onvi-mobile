import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

interface SubnetBlockConfig {
  enabled: boolean;
  subnets: string[];
}

@Injectable()
export class SubnetBlockConfigService implements OnModuleInit {
  private config: SubnetBlockConfig = { enabled: false, subnets: [] };

  onModuleInit() {
    this.reload();
  }

  reload(): void {
    const configPath =
      process.env.SUBNET_BLOCK_CONFIG_PATH ||
      path.join(process.cwd(), 'blocked-subnets.json');
    try {
      const raw = fs.readFileSync(configPath, 'utf-8');
      const parsed = JSON.parse(raw) as SubnetBlockConfig;
      this.config = {
        enabled: Boolean(parsed.enabled),
        subnets: Array.isArray(parsed.subnets)
          ? parsed.subnets.filter((s) => typeof s === 'string' && s.trim())
          : [],
      };
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
}
