import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { getClientIp } from '../utils/client-ip.util';
import { isIpInCidr } from '../utils/ip-subnet.util';
import { SubnetBlockConfigService } from '../../otp-defense/subnet-block-config.service';
import { EnvConfigService } from '../../config/env-config/env-config.service';

@Injectable()
export class BlockSubnetGuard implements CanActivate {
  constructor(
    private readonly subnetConfig: SubnetBlockConfigService,
    private readonly env: EnvConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    if (!this.subnetConfig.isEnabled()) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const trustProxy = this.env.getTrustProxy();
    const ip = getClientIp(request, trustProxy);
    const subnets = this.subnetConfig.getBlockedSubnets();

    for (const cidr of subnets) {
      if (isIpInCidr(ip, cidr)) {
        throw new ForbiddenException('Access denied');
      }
    }
    return true;
  }
}
