import { IAccountRepository } from '../../../domain/account/interface/account-repository.interface';
import { Inject, Injectable } from '@nestjs/common';
import {IJwtService, IJwtServicePayload} from '../../../domain/auth/adapters/jwt.interface';
import { IOtpRepository } from '../../../domain/otp/adapter/otp-repository.interface';
import { IDate } from '../../../infrastructure/common/interfaces/date.interface';
import { OTP_EXPIRY_TIME } from '../../../infrastructure/common/constants/constants';

const AccountRepo = () => Inject('AccountRepository');
const JwtService = () => Inject('JwtTokenService');
const OtpRepo = () => Inject('OtpRepository');
const DateService = () => Inject('DateService');

@Injectable()
export class AuthUsecase {
  /*
        TODO
          1) Update jwt and refresh secret, expiry date
          2) Convert ClientEntity --> Client domain
          3) Add login time
          4) Complete setRefresh token
          5) Add bycrypt to hash refresh token
     */
  constructor(
    @AccountRepo() private readonly accountRepository: IAccountRepository,
    @JwtService() private readonly jwtService: IJwtService,
    @OtpRepo() private readonly otpRepository: IOtpRepository,
    @DateService() private readonly dateService: IDate,
  ) {}

  public async isAuthenticated(phone: string) {}

  public async register(phone: string): Promise<any> {}

  /*
      TODO
      1) Convert ClientEntity --> Client domain
      2) Add login time
      3) Complete setRefresh token
      4) Add bycrypt to hash refresh token

   */
  public async validateUserForLocalStrategy(
    phone: string,
    otp: string,
  ): Promise<any> {
    const currentOtp = await this.otpRepository.findOne(phone);
    if (
      !currentOtp ||
      this.dateService.isExpired(currentOtp.expireDate, OTP_EXPIRY_TIME) ||
      currentOtp.otp != otp
    ) {
      return null;
    }

    const account = await this.accountRepository.findOneByPhoneNumber(phone);

    if (!account) {
      return null;
    }

    return account;
  }

  public async validateUserForJwtStrategy(phone: string): Promise<any> {
    const account = await this.accountRepository.findOneByPhoneNumber(phone);
    if (!account) {
      return null;
    }
    return account;
  }

  public async signAccessToken(phone: any) {
    const payload: IJwtServicePayload = { phone: phone };
    const secret = '';
    const expiresIn = '';
    const token = this.jwtService.signToken(payload, secret, expiresIn);
    return token;
  }

  public async signRefreshToken(phone: any) {
    const payload: IJwtServicePayload = { phone: phone };
    const secret = '';
    const expiresIn = '';
    const token = this.jwtService.signToken(payload, secret, expiresIn);
    await this.setCurrentRefreshToken(phone, token);
    return token;
  }

  public async setCurrentRefreshToken(phone: string, refreshToken: string) {}

  public async getAccountIfRefreshTokenMatches(
    refreshToken: string,
    phone: string,
  ) {
    const account = await this.accountRepository.findOneByPhoneNumber(phone);
    if (!account) {
      return null;
    }
    if (refreshToken != account.refreshToken) {
      return null;
    }
    return account;
  }

  public async logout(phone: string) {}
  private async sendOtp(phone: string): Promise<any> {}
}
