import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { HttpStatus, Injectable } from '@nestjs/common';
import { AuthUsecase } from '../../../application/usecases/auth/auth.usecase';
import { EnvConfigService } from '../../config/env-config/env-config.service';
import { TokenPaload } from '../../../domain/auth/model/auth';
import { Client } from '../../../domain/account/client/model/client';
import { InvalidAccessException } from '../../../domain/auth/exceptions/invalida-token.excpetion';
import { CustomHttpException } from '../exceptions/custom-http.exception';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsJwtStrategy extends PassportStrategy(Strategy, 'wsjwt') {
  constructor(
    private readonly authUsecase: AuthUsecase,
    private readonly configService: EnvConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromUrlQueryParameter('bearerToken'),
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
        throw new WsException('Unauthorized access');
      }
    }
  }
}
