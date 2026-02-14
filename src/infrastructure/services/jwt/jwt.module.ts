import { Module } from '@nestjs/common';
import { JwtModule as Jwt, JwtService } from '@nestjs/jwt';
import { IJwtService } from '../../../domain/auth/adapters/jwt.interface';
import { JwtProvider } from './jwt.provider';
import { StringValue } from 'ms';

@Module({
  imports: [
    Jwt.register({
      secret: process.env.JWT_SCRET,
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRE_TIME || '1h') as StringValue,
      },
    }),
  ],
  providers: [JwtProvider],
  exports: [IJwtService],
})
export class JwtModule {}
