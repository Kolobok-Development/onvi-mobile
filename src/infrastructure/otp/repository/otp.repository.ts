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

  async create({ phone, otp, expireDate }: Otp): Promise<any> {
    const otpObject = await this.otpRepository.create({
      phone,
      otp,
      expireDate,
    });
    return this.otpRepository.save(otpObject);
  }

  async findOne(phone: string): Promise<Otp> {
    return await this.otpRepository.findOne({ where: { phone: phone } });
  }

  async removeOne(phone: string): Promise<void> {
    await this.otpRepository.delete({ phone: phone });
  }

  send(otp: Otp): Promise<any> {
    return Promise.resolve(undefined);
  }
}
