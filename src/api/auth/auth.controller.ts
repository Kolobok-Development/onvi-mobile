import {Body, Controller, HttpCode, Post, Request, UseGuards} from '@nestjs/common';
import { AuthUsecase } from '../../application/usecases/auth/auth.usecase';
import { LoginRequestDto } from './dto/login-request.dto';
import { LocalGuard } from '../../infrastructure/common/guards/local.guard';
import { LoginResponseDto } from './dto/response/login-response.dto';
import { AuthType } from '../../domain/auth/enums/auth-type.enum';


@Controller('auth')
export class AuthController {
  constructor(private readonly authUsecase: AuthUsecase) {}

  @UseGuards(LocalGuard)
  @HttpCode(200)
  @Post('/login')
  async login(@Body() auth: LoginRequestDto, @Request() req: any) {
    const { user } = req;
    if (user.register) {
      return new LoginResponseDto({
        client: null,
        tokens: null,
        type: AuthType.REGISTER,
      });
    }
    const accessToken = await this.authUsecase.signAccessToken(auth.phone);
    const refreshToken = await this.authUsecase.signRefreshToken(auth.phone);
    return new LoginResponseDto({
      client: user,
      tokens: {
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
      type: AuthType.LOGIN,
    });
  }
}
