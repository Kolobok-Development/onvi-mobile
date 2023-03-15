import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccountModule } from './domain/account/account.module';
import { AccountRespositoryModule } from './persistence/account/account-respository.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    AccountRespositoryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
