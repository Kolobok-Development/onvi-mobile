import { IOtpRepository } from '../../../domain/otp/adapter/otp-repository.interface';
import { Otp } from '../../../domain/otp/model/otp';
import { InjectRepository } from '@nestjs/typeorm';
import { OtpEntity } from '../entity/otp.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SendSmsResponseDto } from '../../../application/usecases/auth/dto/send-sms.dto';
import { map } from 'rxjs/operators';
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

  async send(otp: Otp): Promise<any> {
    const header: any = this.setHeaders();
    const params: string = this.setParams(
      'Ваш код доступа: #' + otp.otp,
      otp.phone,
    );
    try {
      return this.httpService
        .post(this.urlSms, params, header)
        .pipe(
          map((axiosResponse: AxiosResponse) => {
            return { message: 'Success', to: otp.phone };
          }),
        )
        .subscribe((result) => {
          console.log(result); // Здесь выведется результат операции map
        });
    } catch (e) {
      throw new AuthentificationException([
        `Error sending otp to ${otp.phone}`,
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
