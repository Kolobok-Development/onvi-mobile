import { Provider } from '@nestjs/common';
import { EnvConfigService } from './env-config.service';
import { IJwtConfig } from '../../../domain/config/jwt-config.interface';

export const EnvConfigProvider: Provider = {
  provide: IJwtConfig,
  useClass: EnvConfigService,
};
