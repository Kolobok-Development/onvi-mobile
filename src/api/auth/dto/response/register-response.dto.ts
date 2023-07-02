import { AuthType } from '../../../../domain/auth/enums/auth-type.enum';

export class RegisterResponseDto {
  client: any;
  tokens: {
    accessToken: string;
    accessTokenExp: string;
    refreshToken: string;
    refreshTokenExp: string;
  };
  type: AuthType;

  constructor(partial: Partial<RegisterResponseDto>) {
    Object.assign(this, partial);
  }
}
