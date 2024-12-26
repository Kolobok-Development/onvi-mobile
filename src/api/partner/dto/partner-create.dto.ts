import {IsEnum, IsNotEmpty, IsString} from "class-validator";
import {PartnerTypeEnum} from "../../../infrastructure/partner/enum/partner-type.enum";
import {PartnerStatusEnum} from "../../../infrastructure/partner/enum/partner-status.enum";

export class PartnerCreateDto {
    @IsEnum(PartnerTypeEnum)
    @IsNotEmpty({ message: 'type is required' })
    type: PartnerTypeEnum;
    @IsString()
    @IsNotEmpty({ message: 'name is required' })
    name: string;
    @IsEnum(PartnerStatusEnum)
    @IsNotEmpty({ message: 'status is required' })
    status: PartnerStatusEnum;
}