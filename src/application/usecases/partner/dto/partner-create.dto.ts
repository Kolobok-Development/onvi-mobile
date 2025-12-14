import { PartnerTypeEnum } from '../../../../infrastructure/partner/enum/partner-type.enum';
import { PartnerStatusEnum } from '../../../../infrastructure/partner/enum/partner-status.enum';

export class PartnerCreateDto {
  type: PartnerTypeEnum;
  name: string;
  status: PartnerStatusEnum;
}
