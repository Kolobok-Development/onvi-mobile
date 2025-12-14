import { Injectable } from '@nestjs/common';
import { IPartnerRepository } from '../../../domain/partner/partner-repository.abstract';
import { Partner } from '../../../domain/partner/model/partner.model';
import { PartnerCreateDto } from './dto/partner-create.dto';

@Injectable()
export class PartnerUsecase {
  constructor(private readonly partnerRepository: IPartnerRepository) {}

  async createPartner(data: PartnerCreateDto): Promise<Partner> {
    const partner = Partner.create(data);
    return this.partnerRepository.create(partner);
  }
}
