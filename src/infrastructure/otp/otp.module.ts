import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpEntity } from './entity/otp.entity';
import { OtpRepositoryProvider } from './provider/otp-repository.provider';

@Module({
  imports: [TypeOrmModule.forFeature([OtpEntity])],
  providers: [OtpRepositoryProvider],
  exports: [OtpRepositoryProvider],
})
export class OtpModule {}
