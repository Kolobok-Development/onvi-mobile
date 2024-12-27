import {GazpromSessionDto} from "../../../infrastructure/partner/gazprom/dto/gazprom-session.dto";
import {GazpromErrorDto} from "../../../infrastructure/partner/gazprom/dto/gazprom-error.dto";
import {
    GazpromSubscriptionResponseDto
} from "../../../infrastructure/partner/gazprom/dto/gazprom-subscription-response.dto";
import {GazpromUpdateDto} from "../../../infrastructure/partner/gazprom/dto/gazprom-update.dto";
import {GazpromUpdateResponseDto} from "../../../infrastructure/partner/gazprom/dto/gazprom-update-response.dto";

export abstract class IGazpromRepository {
    abstract registration(clientId: number, phoneNumber: string): Promise<GazpromSessionDto | GazpromErrorDto>;
    abstract getSubscriptionData(clientId: number): Promise<GazpromSubscriptionResponseDto | GazpromErrorDto>;
    abstract getSession(clientId: number): Promise<GazpromSessionDto | GazpromErrorDto>;
    abstract updateData(clientId: number, meta: GazpromUpdateDto): Promise<GazpromUpdateResponseDto | GazpromErrorDto>;
}