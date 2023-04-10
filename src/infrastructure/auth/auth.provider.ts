import { Provider } from '@nestjs/common';
import { AuthUsecase } from '../../application/usecases/auth/auth.usecase';

export const AuthProvider: Provider = {
  provide: 'AuthService',
  useClass: AuthUsecase,
};
