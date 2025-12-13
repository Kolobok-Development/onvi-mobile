import { IOtpRepository } from '../../../domain/otp/adapter/otp-repository.interface';
import { Otp } from '../../../domain/otp/model/otp';
import { InjectRepository } from '@nestjs/typeorm';
import { OtpEntity } from '../entity/otp.entity';
import { Repository } from 'typeorm';
import { Injectable, Inject } from '@nestjs/common';
import { MoreThanOrEqual } from 'typeorm';
import { Logger } from 'nestjs-pino';
import { Observable } from 'rxjs';
import { SendSmsResponseDto } from '../../../application/usecases/auth/dto/send-sms.dto';
import { map, catchError } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
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
     
    const params: string = this.setParams(
      '<#> Ваш код доступа: ' + otp.otp,
      otp.phone,
    );
    try {
      const result = await firstValueFrom(
        this.httpService
          .post(this.urlSms, params, header)
          .pipe(
            map(() => {
              return { message: 'Success', to: otp.phone };
            }),
            catchError((error) => {
              this.logger.error(
                {
                  error: error.message,
                  phone: otp.phone,
                  url: this.urlSms,
                },
                `Failed to send OTP to ${otp.phone}`,
              );
              throw new AuthentificationException([
                `Error sending otp to ${otp.phone}: ${error.message}`,
              ]);
            }),
          ),
      );
      
      this.logger.log(
        { phone: otp.phone },
        `OTP sent successfully to ${otp.phone}`,
      );
      
      return result;
    } catch (e) {
      if (e instanceof AuthentificationException) {
        throw e;
      }
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
