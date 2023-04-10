import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpEntity } from './entity/otp.entity';
import {
  OtpRepositoryProvider,
} from './provider/otp-repository.provider';
import { OtpRepository } from './repository/otp.repository';

@Module({
  imports: [TypeOrmModule.forFeature([OtpEntity])],
  providers: [OtpRepositoryProvider],
  exports: [OtpRepositoryProvider],
})
export class OtpModule {}
