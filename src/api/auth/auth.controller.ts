import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Post,
  Req,
  Request,
  UnprocessableEntityException,
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
import { InvalidOtpException } from '../../domain/auth/exceptions/invalid-otp.exception';
import { AccountNotFoundExceptions } from '../../domain/account/exceptions/account-not-found.exceptions';
import { OtpInternalExceptions } from '../../domain/otp/exceptions/otp-internal.exceptions';
import { RefreshGuard } from '../../infrastructure/common/guards/refresh.guard';
import { RefreshRequestDto } from './dto/refresh-request.dto';
import { RefreshResponseDto } from './dto/response/refresh-response.dto';
import { use } from 'passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authUsecase: AuthUsecase) {}

  @UseGuards(LocalGuard)
  @HttpCode(200)
  @Post('/login')
  async login(@Body() auth: LoginRequestDto, @Request() req: any) {
    try {
      const { user } = req;
      if (user.register) {
        return new LoginResponseDto({
          client: null,
          tokens: null,
          type: AuthType.REGISTER_REQUIRED,
        });
      }
      const accessToken = await this.authUsecase.signAccessToken(auth.phone);
      const refresh = await this.authUsecase.signRefreshToken(auth.phone);
      await this.authUsecase.setCurrentRefreshToken(auth.phone, refresh.token);

      const { refreshToken, ...shortUser } = user.getAccountInfo();

      return new LoginResponseDto({
        client: shortUser,
        tokens: {
          accessToken: accessToken.token,
          accessTokenExp: accessToken.expirationDate,
          refreshToken: refreshToken.token,
          refreshTokenExp: refreshToken.expirationDate,
        },
        type: AuthType.LOGIN_SUCCESS,
      });
    } catch (e) {
      throw new InternalServerErrorException(
        { message: e.message },
        { cause: e },
      );
    }
  }

  @Post('/register')
  @HttpCode(201)
  async register(@Body() auth: RegisterRequestDto, @Request() req: any) {
    try {
      const { newAccount, accessToken, refresh } =
        await this.authUsecase.register(auth.phone, auth.otp);

      const { refreshToken, ...shortUser } = newAccount.getAccountInfo();
      return new RegisterResponseDto({
        client: shortUser.getAccountInfo(),
        tokens: {
          accessToken: accessToken,
          refreshToken: refresh,
        },
        type: AuthType.REGISTER_SUCCESS,
      });
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
      } else if (e instanceof AccountNotFoundExceptions) {
        throw new NotFoundException(
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
      if (e instanceof OtpInternalExceptions) {
        throw new InternalServerErrorException(
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

  @HttpCode(200)
  @UseGuards(RefreshGuard)
  @Post('refresh')
  async refresh(@Body() RefreshRequestDto: any, @Req() request: any) {
    const { user } = request;
    const accessToken = await this.authUsecase.signAccessToken(
      user.correctPhone,
    );
    return new RefreshResponseDto({
      accessToken: accessToken.token,
      accessTokenExp: accessToken.expirationDate,
    });
  }
}
