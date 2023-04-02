import { Module } from '@nestjs/common';
import { AccountRepositoryProvider } from '../account/provider/account-repository.provider';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule],
  providers: [AccountRepositoryProvider],
  exports: [],
})
export class AuthModule {}
