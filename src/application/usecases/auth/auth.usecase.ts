import { Injectable, Inject } from '@nestjs/common';
import {
  IJwtService,
  IJwtServicePayload,
} from '../../../domain/auth/adapters/jwt.interface';
import { IOtpRepository } from '../../../domain/otp/adapter/otp-repository.interface';
import { IDate } from '../../../infrastructure/common/interfaces/date.interface';
import { OTP_EXPIRY_TIME } from '../../../infrastructure/common/constants/constants';
import { IJwtConfig } from '../../../domain/config/jwt-config.interface';
import { IBcrypt } from '../../../domain/auth/adapters/bcrypt.interface';
import { ClientType } from '../../../domain/account/client/enum/clinet-type.enum';
import { Otp } from '../../../domain/otp/model/otp';
import { InvalidOtpException } from '../../../domain/auth/exceptions/invalid-otp.exception';
import { AccountExistsException } from '../../../domain/account/exceptions/account-exists.exception';
import { OtpInternalExceptions } from '../../../domain/otp/exceptions/otp-internal.exceptions';
import { InvalidRefreshException } from '../../../domain/auth/exceptions/invalid-refresh.exception';
import * as ms from 'ms';
import { ICreateClientDto } from '../../../domain/dto/account-create-client.dto';
import { ICreateCardDto } from '../../../domain/dto/account-create-card.dto';
import { CardType } from '../../../domain/account/card/enum/card-type.enum';
import { AuthenticationException } from '../../../infrastructure/common/exceptions/base.exceptions';
import { InvalidAccessException } from '../../../domain/auth/exceptions/invalida-token.excpetion';
import * as otpGenerator from 'otp-generator';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CardRepository } from '../../../infrastructure/account/repository/card.repository';
import { Client } from '../../../domain/account/client/model/client';
import { Card } from '../../../domain/account/card/model/card';
import { AccountNotFoundExceptions } from '../../../domain/account/exceptions/account-not-found.exceptions';
import { IClientRepository } from '../../../domain/account/client/client-repository.abstract';
import { ICardRepository } from '../../../domain/account/card/card-repository.abstract';
import { PromoCode } from '../../../domain/promo-code/model/promo-code.model';
import { PromocodeUsecase } from '../promocode/promocode.usecase';
import { Logger } from 'nestjs-pino';

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
    private readonly clientRepository: IClientRepository,
    private readonly cardRepository: ICardRepository,
    private readonly jwtService: IJwtService,
    private readonly otpRepository: IOtpRepository,
    private readonly dateService: IDate,
    private readonly jwtConfig: IJwtConfig,
    private readonly bcryptService: IBcrypt,
    private readonly promoCodeUsecase: PromocodeUsecase,
    @Inject(Logger) private readonly logger: Logger,
  ) { }

  //public async isAuthenticated(phone: string) {}

  public async register(phone: string, otp: string): Promise<any> {
    // Validate OTP
    const currentOtp = await this.otpRepository.findOne(phone);

    if (
      !currentOtp ||
      this.dateService.isExpired(currentOtp.expireDate, OTP_EXPIRY_TIME) ||
      currentOtp.otp != otp
    ) {
      throw new InvalidOtpException(phone);
    }

    //Check if user already exists
    const account: Client = await this.clientRepository.findOneByPhone(phone);
    const oldClient: Client = await this.clientRepository.findOneOldClientByPhone(phone);

    if (account && account.isActivated != 0 && account.getCard().isDel != 1) {
      throw new AccountExistsException(phone);
    }

    //Generate token
    const accessToken = await this.signAccessToken(phone);
    const refreshToken = await this.signRefreshToken(phone);

    //If client was deleted
    if (
      account &&
      !account.isClientActive() &&
      !account.getCard().isCardActive()
    ) {
      account.isActivated = 1;
      account.getCard().isDel = 0;
      account.refreshToken = refreshToken.token;

      const isUpdated = await this.clientRepository.update(account);
      const isReactivated = await this.cardRepository.reActivate(
        account.getCard().cardId,
      );

      if (!isUpdated && !isReactivated)
        throw new AccountNotFoundExceptions(account.phone);

      const newClient = account;

      return { newClient, accessToken, refreshToken };
    }

    // Create new client model
    const clientData: ICreateClientDto = {
      rawPhone: phone,
      clientType: ClientType.INDIVIDUAL,
      refreshToken: refreshToken.token,
    };

    const uniqNomer = await this.generateNomerCard();

    const client: Client = Client.create(clientData);
    const newClient = await this.clientRepository.create(client);

    const cardData: ICreateCardDto = {
      clientId: newClient.clientId,
      nomer: uniqNomer,
      devNomer: uniqNomer,
      cardTypeId: CardType.ONVI,
      beginDate: new Date(Date.now()),
      isDel: 1,
    };

    const card: Card = Card.create(cardData);

    const newCard = await this.cardRepository.create(card, newClient);

    newClient.addCard(newCard);

    await this.setCurrentRefreshToken(phone, refreshToken.token);

    if (oldClient) {
      this.logger.log({
        message: "old Client",
        oldClient: oldClient,
        oldCard: oldClient.getCard(),
        phone: phone,
      });
    
      const expirationDate = new Date();
      const newMonth = expirationDate.getMonth() + 3;
      expirationDate.setMonth(newMonth);

      const promoCodeDate = new PromoCode(
        `ONVI${newCard.cardId}`,
        1,
        expirationDate,
        1,
        new Date(),
        3,
        1,
        {
          discount: 250,
          updatedAt: new Date(),
        },
      );
      const promoCode = await this.promoCodeUsecase.create(promoCodeDate);
      this.logger.log(
        {
          action: 'promo_code_created',
          timestamp: new Date(),
          clientId: newClient.clientId,
          details: JSON.stringify({
            promoCode: promoCode.code,
            discount: 250,
            expirationDate: expirationDate,
          }),
        },
        `Promo code ${promoCode.code} created for air balance transfer`,
      );

      await this.promoCodeUsecase.bindClient(promoCode, newClient);
    }

    return { newClient, accessToken, refreshToken };
  }

  public async validateUserForLocalStrategy(
    phone: string,
    otp: string,
  ): Promise<any> {
    const currentOtp = await this.otpRepository.findOne(phone);
    if (
      !currentOtp ||
      this.dateService.isExpired(currentOtp.expireDate, OTP_EXPIRY_TIME) ||
      currentOtp.otp !== otp
    ) {
      throw new InvalidOtpException(phone);
    }

    const account: Client = await this.clientRepository.findOneByPhone(phone);

    if (!account) {
      return null;
    }

    const card: Card = account.getCard();

    if (!account.isClientActive() && !card.isCardActive()) {
      return null;
    }

    if (account) return account;
  }

  public async validateUserForJwtStrategy(phone: string): Promise<any> {
    const account = await this.clientRepository.findOneByPhone(phone);
    if (!account) {
      throw new InvalidAccessException(phone);
    }
    return account;
  }

  public async signAccessToken(phone: any) {
    const payload: IJwtServicePayload = { phone: phone };
    const secret = this.jwtConfig.getJwtSecret();
    const expiresIn = this.jwtConfig.getJwtExpirationTime();
    const token = this.jwtService.signToken(payload, secret, expiresIn);
    const expirationDate = new Date(
      new Date().getTime() + Math.floor(ms(expiresIn) / 1000) * 1000,
    ).toISOString();
    return { token, expirationDate };
  }

  public async signRefreshToken(phone: any) {
    const payload: IJwtServicePayload = { phone: phone };
    const secret = this.jwtConfig.getJwtRefreshSecret();
    const expiresIn = this.jwtConfig.getJwtRefreshExpirationTime();
    const token = this.jwtService.signToken(payload, secret, expiresIn);
    const expirationDate = new Date(
      new Date().getTime() + Math.floor(ms(expiresIn) / 1000) * 1000,
    ).toISOString();

    return { token, expirationDate };
  }

  public async setCurrentRefreshToken(
    phone: string,
    refreshToken: string,
  ): Promise<void> {
    //const hashedRefreshToken = await this.bcryptService.hash(refreshToken);
    await this.clientRepository.setRefreshToken(phone, refreshToken);
  }

  public async getAccountIfRefreshTokenMatches(
    refreshToken: string,
    phone: string,
  ) {
    const account = await this.clientRepository.findOneByPhone(phone);
    if (!account) {
      return null;
    }

    const isRefreshingTokenMatching = account.refreshToken === refreshToken;

    if (isRefreshingTokenMatching) {
      return account;
    }

    throw new InvalidRefreshException(phone);
  }

  private formatPhone(phone): string {
    return phone.replace(/^\s*\+|\s*/g, '');
  }

  public async sendOtp(phone: string, ipAddress = 'unknown'): Promise<any> {
    // First check if this phone is allowed to request OTP (throttling/tracking)

    // Generate expiry time
    const otpTime = this.dateService.generateOtpTime();

    // Generate OTP code
    let otpCode = this.generateOtp();

    // Test account bypass - ONLY FOR DEVELOPMENT
    if (process.env.NODE_ENV !== 'production' && phone === '+79999999999') {
      otpCode = '0000';
    }

    // Create new OTP model
    const otp = new Otp(null, phone, otpCode, otpTime);
    otp.ipAddress = ipAddress;

    // Remove any existing OTP
    await this.otpRepository.removeOne(phone);

    // Save new OTP and return
    const newOtp = await this.otpRepository.create(otp);

    // Track this request

    // Send the OTP
    await this.otpRepository.send(newOtp);

    if (!newOtp) {
      throw new OtpInternalExceptions(phone, otp.otp);
    }

    return newOtp;
  }

  private generateOtp() {
    return otpGenerator.generate(4, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });
  }

  private async generateNomerCard() {
    let newNomer = '';
    do {
      newNomer = this.generateRandom12DigitNumber();
      console.log(newNomer);
    } while (await this.cardRepository.findOneByDevNomer(newNomer));
    return newNomer;
  }
  private generateRandom12DigitNumber() {
    const min = 100000000000; // Минимальное 12-значное число
    const max = 999999999999; // Максимальное 12-значное число
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomNumber.toString(); // Преобразование числа в строку
  }
}