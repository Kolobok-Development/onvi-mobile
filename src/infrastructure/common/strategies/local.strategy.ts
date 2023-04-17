import { PassportStrategy } from '@nestjs/passport';
import {
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AuthUsecase } from '../../../application/usecases/auth/auth.usecase';
import { Strategy } from 'passport-local';
import { InvalidOtpException } from '../../../domain/auth/exceptions/invalid-otp.exception';

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
    try {
      const client = await this.authService.validateUserForLocalStrategy(
        phone,
        otp,
      );

      if (!client) {
        return done(null, { register: true });
      }

      return done(null, client);
    } catch (e) {
      if (e instanceof InvalidOtpException) {
        throw new UnprocessableEntityException(
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
