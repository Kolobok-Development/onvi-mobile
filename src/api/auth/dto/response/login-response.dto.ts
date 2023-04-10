import { AuthType } from '../../../../domain/auth/enums/auth-type.enum';

export class LoginResponseDto {
  client: any;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  type: AuthType;

  constructor(partial: Partial<LoginResponseDto>) {
    Object.assign(this, partial);
  }
}
