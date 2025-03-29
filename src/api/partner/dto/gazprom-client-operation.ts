import {IsEnum, IsNotEmpty, IsNumber} from "class-validator";
import {Transform} from "class-transformer";
import {PartnerOfferStatusEnum} from "../../../infrastructure/partner/enum/partner-offer-status.enum";

export class GazpromClientOperationDto{
    @IsNumber()
    @IsNotEmpty({ message: 'bonus_points is required' })
    bonus_points: string;
    @IsNotEmpty({ message: 'last_visit is required' })
    @Transform(({ value }) => new Date(value))
    last_visit: Date;
    @IsEnum(PartnerOfferStatusEnum)
    @IsNotEmpty({ message: 'offer_status is required' })
    offer_status: PartnerOfferStatusEnum;
}