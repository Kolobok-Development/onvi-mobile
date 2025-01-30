import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import Strategy from 'passport-headerapikey';
import { IPartnerRepository } from '../../../domain/partner/partner-repository.abstract';

@Injectable()
export class PartnerStrategy extends PassportStrategy(Strategy, 'partner') {
  constructor(private readonly partnerRepository: IPartnerRepository) {
    super(
      {
        header: 'API-KEY',
        prefix: '',
      },
      true,
      async (apiKey, done) => {
        return this.validate(apiKey, done);
      },
    );
  }

  async validate(
    partnerKey: string,
    done: (error: Error, data) => Record<string, unknown>,
  ) {
    try {
      const partner = await this.partnerRepository.findOneByToken(partnerKey);
      if (!partner) {
        new UnauthorizedException('Invalid or expired API key');
      }
      return done(null, partner);
    } catch (error) {
      done(new UnauthorizedException('Unauthorized'), null);
    }
  }
}
