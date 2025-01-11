import { Provider } from '@nestjs/common';
import { IPosService } from '../interface/pos.interface';
import { PosService } from '../pos.service';

export const PosServiceProvider: Provider = {
  provide: 'IPosService',
  useClass: PosService,
};
