import { IOtpRepository } from '../../../domain/otp/adapter/otp-repository.interface';
import { Otp } from '../../../domain/otp/model/otp';
import { InjectRepository } from '@nestjs/typeorm';
import { OtpEntity } from '../entity/otp.entity';
import { Repository } from 'typeorm';
import { Injectable, Inject } from '@nestjs/common';
import { MoreThanOrEqual } from 'typeorm';
import { Logger } from 'nestjs-pino';
import { map, catchError } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { AuthentificationException } from '../../../domain/otp/exceptions/authentification.exception';
import * as url from 'url';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class OtpRepository implements IOtpRepository {
  private urlSms: string;
  private loginSms: string;
  private passwordSms: string;
  private senderSms: string;
  constructor(
    @InjectRepository(OtpEntity)
    private readonly otpRepository: Repository<OtpEntity>,
    private readonly httpService: HttpService,
    @Inject(Logger) private readonly logger: Logger,
  ) {
    this.urlSms = process.env.BEELINE_URL;
    this.loginSms = process.env.BEELINE_LOGIN;
    this.passwordSms = process.env.BEELINE_PSWD;
    this.senderSms = process.env.BEELINE_SENDER;
  }

  async create(otp: Otp): Promise<any> {
    const otpEntity = this.toOtpEntity(otp);
    const newOtpEntity = await this.otpRepository.save(otpEntity);
    const newOtp = this.toOtp(newOtpEntity);
    return newOtp;
  }

  async findOne(phone: string): Promise<Otp> {
    return await this.otpRepository.findOne({ where: { phone: phone } });
  }

  async removeOne(phone: string): Promise<void> {
    await this.otpRepository.delete({ phone: phone });
  }

  async getRecentAttempts(phone: string): Promise<number> {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    return this.otpRepository.count({
      where: {
        phone: phone,
        createDate: MoreThanOrEqual(oneHourAgo),
      },
    });
  }

  async send(otp: Otp): Promise<any> {
    const header: any = this.setHeaders();
    const startTime = Date.now();

    const params: string = this.setParams(
      '<#> Ваш код доступа: ' + otp.otp,
      otp.phone,
    );
    try {
      const result = await firstValueFrom(
        this.httpService.post(this.urlSms, params, header).pipe(
          map(() => {
            return { message: 'Success', to: otp.phone };
          }),
          catchError((error) => {
            const duration = Date.now() - startTime;
            this.logger.error(
              {
                context: 'OTP_SEND',
                action: 'send_otp_failed',
                phone: otp.phone,
                duration: `${duration}ms`,
                error: {
                  message: error.message,
                  code: error.code || null,
                  status: error.response?.status || null,
                  statusText: error.response?.statusText || null,
                },
                smsProvider: {
                  url: this.urlSms,
                  login: this.loginSms,
                },
                timestamp: new Date().toISOString(),
              },
              `Failed to send OTP to ${otp.phone}: ${error.message}`,
            );
            throw new AuthentificationException([
              `Error sending otp to ${otp.phone}: ${error.message}`,
            ]);
          }),
        ),
      );

      const duration = Date.now() - startTime;
      this.logger.log(
        {
          context: 'OTP_SEND',
          action: 'send_otp_success',
          phone: otp.phone,
          duration: `${duration}ms`,
          timestamp: new Date().toISOString(),
        },
        `OTP sent successfully to ${otp.phone} in ${duration}ms`,
      );

      return result;
    } catch (e) {
      if (e instanceof AuthentificationException) {
        throw e;
      }
      const duration = Date.now() - startTime;
      this.logger.error(
        {
          context: 'OTP_SEND',
          action: 'send_otp_exception',
          phone: otp.phone,
          duration: `${duration}ms`,
          error: {
            message: e.message,
            name: e.name || 'Error',
            stack: e.stack || null,
          },
          timestamp: new Date().toISOString(),
        },
        `Unexpected error sending OTP to ${otp.phone}: ${e.message}`,
      );
      throw new AuthentificationException([
        `Error sending otp to ${otp.phone}: ${e.message}`,
      ]);
    }
  }

  private toOtp(otpEntity: OtpEntity): Otp {
    const otp = new Otp(
      otpEntity.id,
      otpEntity.phone,
      otpEntity.otp,
      otpEntity.expireDate,
    );

    return otp;
  }

  private toOtpEntity(otp: Otp): OtpEntity {
    const otpEntity = new OtpEntity();

    otpEntity.otp = otp.otp;
    otpEntity.phone = otp.phone;
    otpEntity.expireDate = otp.expireDate;

    return otpEntity;
  }

  private setParams(message: string, target: string): string {
    const params = {
      user: this.loginSms,
      pass: this.passwordSms,
      action: 'post_sms',
      message: message,
      target: target,
      sender: this.senderSms,
    };

    return new url.URLSearchParams(params).toString();
  }

  /**
   * Set headers for the request
   * @private
   */
  private setHeaders(): {
    headers: { 'Content-Type': string; Accept: string };
  } {
    return {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'text/xml',
      },
    };
  }
}
