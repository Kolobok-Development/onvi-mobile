import { Provider } from '@nestjs/common';
import { PartnerRepository } from '../repository/partner.repository';
import { IPartnerRepository } from '../../../domain/partner/partner-repository.abstract';

export const PartnerRepositoryProvider: Provider = {
  provide: IPartnerRepository,
  useClass: PartnerRepository,
};
