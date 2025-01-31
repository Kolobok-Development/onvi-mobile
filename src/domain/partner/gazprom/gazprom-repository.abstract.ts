import {GazpromSessionDto} from "../../../infrastructure/partner/gazprom/dto/gazprom-session.dto";
import {GazpromErrorDto} from "../../../infrastructure/partner/gazprom/dto/gazprom-error.dto";
import {
    GazpromSubscriptionResponseDto
} from "../../../infrastructure/partner/gazprom/dto/gazprom-subscription-response.dto";
import {GazpromUpdateDto} from "../../../infrastructure/partner/gazprom/dto/gazprom-update.dto";
import {GazpromUpdateResponseDto} from "../../../infrastructure/partner/gazprom/dto/gazprom-update-response.dto";

export abstract class IGazpromRepository {
    abstract registration(partnerClientId: string, phoneNumber: string): Promise<GazpromSessionDto | GazpromErrorDto>;
    abstract reference(reference: string, partnerClientId: string, phoneNumber: string): Promise<GazpromSessionDto | GazpromErrorDto>;
    abstract getSubscriptionData(partnerClientId: string): Promise<GazpromSubscriptionResponseDto | GazpromErrorDto>;
    abstract getSession(partnerClientId: string): Promise<GazpromSessionDto | GazpromErrorDto>;
    abstract updateData(partnerClientId: string, meta: GazpromUpdateDto): Promise<GazpromUpdateResponseDto | GazpromErrorDto>;
}