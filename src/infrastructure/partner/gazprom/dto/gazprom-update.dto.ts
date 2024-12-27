import {PartnerStatusEnum} from "../../enum/partner-status.enum";

export class GazpromUpdateDto {
    meta: {
        cashback_discount: string;
        cashback_discount_expires_at: string;
        offer_status: PartnerStatusEnum;
    }
}