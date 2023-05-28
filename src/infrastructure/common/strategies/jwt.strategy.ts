import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUsecase } from '../../../application/usecases/auth/auth.usecase';
import { EnvConfigService } from '../../config/env-config/env-config.service';
import { Request } from 'express';
import { TokenPaload } from '../../../domain/auth/model/auth';
import { Client } from '../../../domain/account/client/model/client';
import { InvalidAccessException } from '../../../domain/auth/exceptions/invalida-token.excpetion';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly authUsecase: AuthUsecase,
    private readonly configService: EnvConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getJwtSecret(),
    });
  }

  async validate(payload: TokenPaload): Promise<Client> {
    try {
      const account: Client = await this.authUsecase.validateUserForJwtStrategy(
        payload.phone,
      );

      return account;
    } catch (e) {
      if (e instanceof InvalidAccessException) {
        console.log(e);
      }
    }
  }
}
