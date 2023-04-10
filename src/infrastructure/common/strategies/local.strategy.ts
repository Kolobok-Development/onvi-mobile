import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthUsecase } from '../../../application/usecases/auth/auth.usecase';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthUsecase) {
    super({
      usernameField: 'phone',
      passwordField: 'otp',
    });
  }

  async validate(
    phone: string,
    otp: string,
    done: (error: Error, data) => Record<string, unknown>,
  ) {
    const client = await this.authService.validateUserForLocalStrategy(
      phone,
      otp,
    );

    if (!client) {
      return done(null, { register: true });
    }

    return done(null, client);
  }
}
