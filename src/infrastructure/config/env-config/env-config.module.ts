import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvConfigProvider } from './env-config.provider';
import { EnvConfigService } from './env-config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
  ],
  providers: [EnvConfigProvider, EnvConfigService],
  exports: [EnvConfigProvider, EnvConfigService],
})
export class EnvConfigModule {}
