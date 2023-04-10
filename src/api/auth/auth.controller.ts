import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthUsecase } from '../../application/usecases/auth/auth.usecase';
import { LoginRequestDto } from './dto/login-request.dto';
import { LocalGuard } from '../../infrastructure/common/guards/local.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authUsecase: AuthUsecase) {}

  @UseGuards(LocalGuard)
  @Post('/login')
  async login(@Body() auth: LoginRequestDto, @Request() req: any) {
    const accessToken = await this.authUsecase.signAccessToken(auth.phone);
    const refreshToken = await this.authUsecase.signRefreshToken(auth.phone);
    return 'Login Success';
  }
}
