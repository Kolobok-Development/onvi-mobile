import { Module } from '@nestjs/common';
import { JwtModule as Jwt } from '@nestjs/jwt';
import { JwtProvider } from './jwt.provider';

@Module({
  imports: [
    Jwt.register({
      secret: process.env.JWT_SCRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRE_TIME },
    }),
  ],
  providers: [JwtProvider],
  exports: [JwtProvider],
})
export class JwtModule {}
