import {PartnerOfferStatusEnum} from "../../enum/partner-offer-status.enum";

export class GazpromUpdateOperDto {
    meta: {
        bonus_points: string;
        last_visit: Date;
        offer_status: PartnerOfferStatusEnum;
    }
}