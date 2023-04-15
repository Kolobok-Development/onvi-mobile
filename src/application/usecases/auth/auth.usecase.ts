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
import { Client } from '../../../domain/account/model/client';
import { Card } from '../../../domain/account/model/card';
import { ClientType } from '../../../domain/account/enum/clinet-type.enum';
import { CardType } from '../../../domain/account/enum/card-type.enum';
import { Otp } from '../../../domain/otp/model/otp';

@Injectable()
export class AuthUsecase {
  /*
        TODO
          1) Update jwt and refresh secret, expiry date [Completed]
          2) Convert ClientEntity --> Client domain [Completed]
          3) Add login time
          4) Complete setRefresh token [Completed]
          5) Add bycrypt to hash refresh token.  [Completed]
          6) Add response serialization [Completed]
          7) Add excepiton filter [Completed]
          8)
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

  public async register(phone: string, otp: string): Promise<any> {
    // Validate OTP
    const currentOtp = await this.otpRepository.findOne(phone);

    if (
      !currentOtp ||
      this.dateService.isExpired(currentOtp.expireDate, OTP_EXPIRY_TIME) ||
      currentOtp.otp != otp
    ) {
      return null;
    }

    //Check if user already exists
    const account = await this.accountRepository.findOneByPhoneNumber(phone);

    if (account) {
      return null;
    }

    //Generate token
    const accessToken = await this.signAccessToken(phone);
    const refreshToken = await this.signRefreshToken(phone);

    //Format phone
    const formattedPhoneNumber = this.formatPhone(phone);
    // Create new client model
    const client = new Client(
      null,
      'Новый пользователь',
      null,
      null,
      formattedPhoneNumber,
      null,
      new Date(Date.now()),
      null,
      ClientType.INDIVIDUAL,
      null,
      1,
      null,
      phone,
      refreshToken,
      null,
      '1',
      new Date(Date.now()),
      null,
      null,
      null,
    );

    //Create card model
    const card = new Card(
      null,
      0,
      0,
      new Date(Date.now()),
      null,
      CardType.ONVI,
      formattedPhoneNumber,
      null,
      null,
      0,
      0,
      formattedPhoneNumber,
      null,
      null,
      null,
    );
    //Create card in the database
    const newAccount = await this.accountRepository.create(card, client);

    return { newAccount, accessToken, refreshToken };
  }

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
    //await this.setCurrentRefreshToken(phone, token);
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

  private formatPhone(phone): string {
    return phone.replace(/^\s*\+|\s*/g, '');
  }

  public async sendOtp(phone: string): Promise<any> {
    //TODO
    //1) Send otp through sms
    //Generate expitry time
    const otpTime = this.dateService.generateOtpTime();
    //Create new otp model
    const otp = new Otp(null, phone, '0000', otpTime);
    //Remove any existing otp
    await this.otpRepository.removeOne(phone);
    //Save new otp and return
    return await this.otpRepository.create(otp);
  }
}
