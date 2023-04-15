import { IOtpRepository } from '../../../domain/otp/adapter/otp-repository.interface';
import { Otp } from '../../../domain/otp/model/otp';
import { InjectRepository } from '@nestjs/typeorm';
import { OtpEntity } from '../entity/otp.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OtpRepository implements IOtpRepository {
  constructor(
    @InjectRepository(OtpEntity)
    private readonly otpRepository: Repository<OtpEntity>,
  ) {}

  async create(otp: Otp): Promise<any> {
    const otpEntity = this.toOtpEntity(otp);
    const newOtpEntity = await this.otpRepository.save(otpEntity);;
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
    return Promise.resolve(undefined);
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
}
