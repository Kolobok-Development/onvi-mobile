import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccountRespositoryModule } from './persistence/account/account-respository.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { PersistenceModule } from './persistence/persistence.module';
import { AuthModule } from './domain/auth/auth.module';
import { JwtModule } from './infrastructure/services/jwt/jwt.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    AccountRespositoryModule,
    PersistenceModule,
    DatabaseModule,
    AuthModule,
    JwtModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
