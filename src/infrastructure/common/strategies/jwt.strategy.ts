import { HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUsecase } from '../../../application/usecases/auth/auth.usecase';
import { EnvConfigService } from '../../config/env-config/env-config.service';
import { Request } from 'express';
import { TokenPaload } from '../../../domain/auth/model/auth';
import { Client } from '../../../domain/account/client/model/client';
import { InvalidAccessException } from '../../../domain/auth/exceptions/invalida-token.excpetion';
import { CustomHttpException } from '../exceptions/custom-http.exception';

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
        throw new CustomHttpException({
          type: e.type,
          innerCode: e.innerCode,
          message: e.message,
          code: HttpStatus.UNAUTHORIZED,
        });
      } else {
        throw new CustomHttpException({
          message: e.message,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
        });
      }
    }
  }
}
