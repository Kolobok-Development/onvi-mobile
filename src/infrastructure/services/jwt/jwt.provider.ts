import { Provider } from '@nestjs/common';
import { JwtTokenService } from './jwt.service';

export const JwtProvider: Provider = {
  provide: 'JwtTokenService',
  useClass: JwtTokenService,
};
