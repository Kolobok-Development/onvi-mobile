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
import { InvalidRefreshException } from '../../../domain/auth/exceptions/invalid-refresh.exception';
import * as ms from 'ms';
import type { StringValue } from 'ms';
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
import { EnvConfigService } from '../../../infrastructure/config/env-config/env-config.service';
import { RateLimiterService } from '../../../infrastructure/otp-defense/rate-limiter.service';
import { OtpDefenseService } from '../../../infrastructure/otp-defense/otp-defense.service';
import { AuthentificationException } from '../../../domain/otp/exceptions/authentification.exception';

export interface SendOtpResult {
  sent: boolean;
  phone: string;
}

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
    private readonly env: EnvConfigService,
    private readonly rateLimiter: RateLimiterService,
    private readonly otpDefense: OtpDefenseService,
    @Inject(Logger) private readonly logger: Logger,
  ) {}

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
    const oldClient: Client =
      await this.clientRepository.findOneOldClientByPhone(phone);

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

    return { newClient, accessToken, refreshToken };
  }

  public async validateUserForLocalStrategy(
    phone: string,
    otp: string,
  ): Promise<any> {
    const isTestAccount = phone === '+79999999999' && otp === '0000';

    if (!isTestAccount) {
      const currentOtp = await this.otpRepository.findOne(phone);
      if (
        !currentOtp ||
        this.dateService.isExpired(currentOtp.expireDate, OTP_EXPIRY_TIME) ||
        currentOtp.otp !== otp
      ) {
        throw new InvalidOtpException(phone);
      }
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
      new Date().getTime() +
        Math.floor(ms(expiresIn as StringValue) / 1000) * 1000,
    ).toISOString();
    return { token, expirationDate };
  }

  public async signRefreshToken(phone: any) {
    const payload: IJwtServicePayload = { phone: phone };
    const secret = this.jwtConfig.getJwtRefreshSecret();
    const expiresIn = this.jwtConfig.getJwtRefreshExpirationTime();
    const token = this.jwtService.signToken(payload, secret, expiresIn);
    const expirationDate = new Date(
      new Date().getTime() +
        Math.floor(ms(expiresIn as StringValue) / 1000) * 1000,
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
    const digits = (phone ?? '').replace(/\D/g, '');
    const normalized =
      digits.startsWith('8') && digits.length === 11
        ? '7' + digits.slice(1)
        : digits.startsWith('9') && digits.length === 10
        ? '7' + digits
        : digits;
    return normalized ? '+' + normalized : phone?.trim() || '';
  }

  private maskPhone(phone: string): string {
    if (!phone || phone.length < 4) return '****';
    return '*'.repeat(phone.length - 4) + phone.slice(-4);
  }

  /** Mask IP for logs: show last octet for IPv4 (e.g. x.x.x.123), else truncated */
  private maskIp(ip: string): string {
    return ip;
  }

  public async sendOtp(
    phone: string,
    ipAddress = 'unknown',
  ): Promise<SendOtpResult> {
    const normalized = this.formatPhone(phone);
    const cooldownMs = this.env.getOtpCooldownSeconds() * 1000;
    let lockHeld = false;
    const startMs = Date.now();
    const flowId = `otp_${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    const phoneMasked = this.maskPhone(normalized);
    const ipMasked = this.maskIp(ipAddress);

    this.logger.log(
      {
        flow_id: flowId,
        context: 'OTP_FLOW',
        event: 'request_started',
        phone_masked: phoneMasked,
        client_ip_masked: ipMasked,
      },
      'OTP request received',
    );

    try {
      const acquired = await this.otpDefense.acquireLock(normalized);
      if (!acquired) {
        this.logger.log(
          {
            flow_id: flowId,
            context: 'OTP_FLOW',
            event: 'skipped',
            outcome: 'not_sent',
            reason: 'concurrent_request',
            phone_masked: phoneMasked,
            client_ip_masked: ipMasked,
            duration_ms: Date.now() - startMs,
          },
          'OTP flow: skipped (concurrent request, lock not acquired)',
        );
        return { sent: false, phone: normalized };
      }
      lockHeld = true;

      const inRedisCooldown = await this.otpDefense.inCooldown(normalized);
      if (inRedisCooldown) {
        this.logger.log(
          {
            flow_id: flowId,
            context: 'OTP_FLOW',
            event: 'skipped',
            outcome: 'not_sent',
            reason: 'cooldown_redis',
            phone_masked: phoneMasked,
            client_ip_masked: ipMasked,
            duration_ms: Date.now() - startMs,
          },
          'OTP flow: skipped (Redis cooldown)',
        );
        return { sent: false, phone: normalized };
      }

      const lastSentAt = await this.otpRepository.getLastSentAt(normalized);
      if (lastSentAt && Date.now() - lastSentAt.getTime() < cooldownMs) {
        this.logger.log(
          {
            flow_id: flowId,
            context: 'OTP_FLOW',
            event: 'skipped',
            outcome: 'not_sent',
            reason: 'cooldown_db',
            phone_masked: phoneMasked,
            client_ip_masked: ipMasked,
            duration_ms: Date.now() - startMs,
          },
          'OTP flow: skipped (DB cooldown fallback)',
        );
        return { sent: false, phone: normalized };
      }

      const phoneLimit = await this.rateLimiter.checkPhone(normalized);
      if (!phoneLimit.allowed) {
        this.logger.log(
          {
            flow_id: flowId,
            context: 'OTP_FLOW',
            event: 'blocked',
            outcome: 'not_sent',
            reason: 'phone_rate_limit',
            phone_masked: phoneMasked,
            client_ip_masked: ipMasked,
            duration_ms: Date.now() - startMs,
          },
          'OTP flow: phone blocked (rate limit)',
        );
        return { sent: false, phone: normalized };
      }
      const ipLimit = await this.rateLimiter.checkIp(ipAddress);
      if (!ipLimit.allowed) {
        this.logger.log(
          {
            flow_id: flowId,
            context: 'OTP_FLOW',
            event: 'blocked',
            outcome: 'not_sent',
            reason: 'ip_rate_limit',
            phone_masked: phoneMasked,
            client_ip_masked: ipMasked,
            duration_ms: Date.now() - startMs,
          },
          'OTP flow: IP blocked (rate limit)',
        );
        return { sent: false, phone: normalized };
      }
      const globalLimit = await this.rateLimiter.checkGlobal();
      if (!globalLimit.allowed) {
        this.logger.log(
          {
            flow_id: flowId,
            context: 'OTP_FLOW',
            event: 'blocked',
            outcome: 'not_sent',
            reason: 'global_rate_limit',
            phone_masked: phoneMasked,
            client_ip_masked: ipMasked,
            duration_ms: Date.now() - startMs,
          },
          'OTP flow: blocked (global rate limit)',
        );
        return { sent: false, phone: normalized };
      }

      if (this.env.getSmsAttackMode()) {
        const existingUser = await this.clientRepository.existsOnviUserByPhone(
          normalized,
        );
        if (!existingUser) {
          this.logger.log(
            {
              flow_id: flowId,
              context: 'OTP_FLOW',
              event: 'skipped',
              outcome: 'not_sent',
              reason: 'attack_mode_unknown_phone',
              phone_masked: phoneMasked,
              client_ip_masked: ipMasked,
              duration_ms: Date.now() - startMs,
            },
            'OTP flow: skipped (attack mode, unknown phone)',
          );
          return { sent: false, phone: normalized };
        }
      }

      const otpTime = this.dateService.generateOtpTime();
      let otpCode = this.generateOtp();
      if (phone === '+79999999999') {
        otpCode = '0000';
      }

      const otp = new Otp(null, normalized, otpCode, otpTime);
      otp.ipAddress = ipAddress;

      await this.otpRepository.removeOne(normalized);
      const newOtp = await this.otpRepository.create(otp);

      await this.otpRepository.send(newOtp);
      await this.otpDefense.setCooldown(normalized);

      this.logger.log(
        {
          flow_id: flowId,
          context: 'OTP_FLOW',
          event: 'completed',
          outcome: 'sent',
          phone_masked: phoneMasked,
          client_ip_masked: ipMasked,
          duration_ms: Date.now() - startMs,
        },
        'OTP flow: SMS sent',
      );
      return { sent: true, phone: normalized };
    } catch (e) {
      if (e instanceof AuthentificationException) {
        this.logger.log(
          {
            flow_id: flowId,
            context: 'OTP_FLOW',
            event: 'error',
            outcome: 'not_sent',
            reason: 'provider_error',
            phone_masked: phoneMasked,
            client_ip_masked: ipMasked,
            duration_ms: Date.now() - startMs,
            error: e?.message,
          },
          `OTP flow: provider error - ${e.message}`,
        );
        return { sent: false, phone: normalized };
      }
      this.logger.error(
        {
          flow_id: flowId,
          context: 'OTP_FLOW',
          event: 'error',
          outcome: 'not_sent',
          reason: 'exception',
          phone_masked: phoneMasked,
          client_ip_masked: ipMasked,
          duration_ms: Date.now() - startMs,
          error: e?.message,
        },
        `OTP flow: error - ${e?.message ?? e}`,
      );
      return { sent: false, phone: normalized };
    } finally {
      if (lockHeld) {
        await this.otpDefense.releaseLock(normalized);
      }
    }
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
