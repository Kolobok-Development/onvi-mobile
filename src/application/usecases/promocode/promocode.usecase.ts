import {Injectable} from "@nestjs/common";
import {IPromoCodeRepository} from "../../../domain/promo-code/promo-code-repository.abstract";
import {Client} from "../../../domain/account/client/model/client";
import {PromoCode} from "../../../domain/promo-code/model/promo-code.model";

@Injectable()
export class PromocodeUsecase {
    constructor(
        private readonly promoCodeRepository: IPromoCodeRepository,
    ) {
    }

    async getActivePromotionHistoryForClient(client: Client) {
        return await this.promoCodeRepository.findByUserAndActive(client.clientId);
    }

    async create(promoCode: PromoCode): Promise<PromoCode> {
        return await this.promoCodeRepository.create(promoCode);
    }

    async bindClient(promoCode: PromoCode, client: Client): Promise<any> {
        return await this.promoCodeRepository.bindClient(promoCode, client);
    }
}