import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthUsecase } from '../../application/usecases/auth/auth.usecase';
import { LoginRequestDto } from './dto/login-request.dto';
import { LocalGuard } from '../../infrastructure/common/guards/local.guard';
import { LoginResponseDto } from './dto/response/login-response.dto';
import { AuthType } from '../../domain/auth/enums/auth-type.enum';
import { RegisterResponseDto } from './dto/response/register-response.dto';
import { OtpRequestDto } from './dto/otp-request.dto';
import { OtpResponseDto } from './dto/response/otp-response.dto';
import { OtpStatus } from '../../domain/otp/enums/otp-status.enum';
import { RegisterRequestDto } from './dto/register-request.dto';

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
        type: AuthType.REGISTER_REQUIRED,
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
      type: AuthType.LOGIN_SUCCESS,
    });
  }

  @Post('/register')
  @HttpCode(201)
  async register(@Body() auth: RegisterRequestDto, @Request() req: any) {
    try {
      const { newAccount, accessToken, refreshToken } =
        await this.authUsecase.register(auth.phone, auth.opt);

      return new RegisterResponseDto({
        client: newAccount,
        tokens: {
          accessToken: accessToken,
          refreshToken: refreshToken,
        },
        type: AuthType.REGISTER_SUCCESS,
      });
    } catch (e) {
      console.log(e);
    }
  }

  @HttpCode(201)
  @Post('/send/otp')
  async sendOtp(@Body() otpRequest: OtpRequestDto) {
    try {
      const phone = otpRequest.phone;
      const otp = await this.authUsecase.sendOtp(phone);
      return new OtpResponseDto({
        status: OtpStatus.SENT_SUCCESS,
        target: otp.phone,
      });
    } catch (e) {
      console.log(e);
    }
  }

  @HttpCode(200)
  @Get('refresh')
  async refresh(@Req() req: any) {
    return 'token';
  }
}
