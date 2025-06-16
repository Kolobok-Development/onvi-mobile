import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpEntity } from './entity/otp.entity';
import { OtpRepositoryProvider } from './provider/otp-repository.provider';
import { HttpModule } from '@nestjs/axios';
import { EnvConfigModule } from '../config/env-config/env-config.module';

@Module({
  imports: [TypeOrmModule.forFeature([OtpEntity]), HttpModule, EnvConfigModule],
  providers: [OtpRepositoryProvider],
  exports: [OtpRepositoryProvider],
})
export class OtpModule {}
