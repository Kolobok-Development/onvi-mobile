import { IAccountRepository } from '../../../domain/account/interface/account-repository.interface';
import { Inject, Injectable } from '@nestjs/common';
import {
  IJwtService,
  IJwtServicePayload,
} from '../../../domain/auth/adapters/jwt.interface';
import { IOtpRepository } from '../../../domain/otp/adapter/otp-repository.interface';
import { IDate } from '../../../infrastructure/common/interfaces/date.interface';
import { OTP_EXPIRY_TIME } from '../../../infrastructure/common/constants/constants';
import { IJwtConfig } from '../../../domain/config/jwt-config.interface';
import { IBcrypt } from '../../../domain/auth/adapters/bcrypt.interface';

@Injectable()
export class AuthUsecase {
  /*
        TODO
          1) Update jwt and refresh secret, expiry date [Completed]
          2) Convert ClientEntity --> Client domain
          3) Add login time
          4) Complete setRefresh token [Completed]
          5) Add bycrypt to hash refresh token.  [Completed]
     */
  constructor(
    private readonly accountRepository: IAccountRepository,
    private readonly jwtService: IJwtService,
    private readonly otpRepository: IOtpRepository,
    private readonly dateService: IDate,
    private readonly jwtConfig: IJwtConfig,
    private readonly bcryptService: IBcrypt,
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
    const secret = this.jwtConfig.getJwtSecret();
    const expiresIn = this.jwtConfig.getJwtExpirationTime();
    const token = this.jwtService.signToken(payload, secret, expiresIn);
    return token;
  }

  public async signRefreshToken(phone: any) {
    const payload: IJwtServicePayload = { phone: phone };
    const secret = this.jwtConfig.getJwtRefreshSecret();
    const expiresIn = this.jwtConfig.getJwtRefreshExpirationTime();
    const token = this.jwtService.signToken(payload, secret, expiresIn);
    await this.setCurrentRefreshToken(phone, token);
    return token;
  }

  public async setCurrentRefreshToken(
    phone: string,
    refreshToken: string,
  ): Promise<void> {
    const hashedRefreshToken = await this.bcryptService.hash(refreshToken);
    await this.accountRepository.setRefreshToken(phone, hashedRefreshToken);
  }

  public async getAccountIfRefreshTokenMatches(
    refreshToken: string,
    phone: string,
  ) {
    const account = await this.accountRepository.findOneByPhoneNumber(phone);
    if (!account) {
      return null;
    }

    const isRefreshingTokenMatching = await this.bcryptService.compare(
      refreshToken,
      account.refreshToken,
    );

    if (isRefreshingTokenMatching) {
      return account;
    }
    return null;
  }

  public async logout(phone: string) {}
  private async sendOtp(phone: string): Promise<any> {}
}
