import { Provider } from '@nestjs/common';
import { BcryptService } from './bcrypt.service';
import { IBcrypt } from '../../../domain/auth/adapters/bcrypt.interface';

export const BcryptProvider: Provider = {
  provide: IBcrypt,
  useClass: BcryptService,
};
