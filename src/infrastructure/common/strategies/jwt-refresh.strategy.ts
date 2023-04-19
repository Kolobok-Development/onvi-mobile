import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthUsecase } from '../../../application/usecases/auth/auth.usecase';
import { EnvConfigService } from '../../config/env-config/env-config.service';
import { TokenPaload } from '../../../domain/auth/model/auth';
import { InvalidRefreshException } from '../../../domain/auth/exceptions/invalid-refresh.exception';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    private readonly authUsecase: AuthUsecase,
    private readonly configService: EnvConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey: configService.getJwtRefreshSecret(),
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: TokenPaload) {
    try {
      const refreshToken = request.body['refreshToken'];
      const account = await this.authUsecase.getAccountIfRefreshTokenMatches(
        refreshToken,
        payload.phone,
      );

      return account;
    } catch (e) {
      if (e instanceof InvalidRefreshException) {
        throw new UnauthorizedException(
          {
            innerCode: e.innerCode,
            message: e.message,
            type: e.type,
          },
          { cause: e },
        );
      } else {
        throw new InternalServerErrorException(
          { message: e.message },
          { cause: e },
        );
      }
    }
  }
}
