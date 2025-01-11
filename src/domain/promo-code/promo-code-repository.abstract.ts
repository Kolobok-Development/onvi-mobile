import { PromoCode } from './model/promo-code.model';
import { Card } from '../account/card/model/card';
import { PromoCodeLocation } from './model/promo-code-location';
import {Client} from "../account/client/model/client";

export abstract class IPromoCodeRepository {
  abstract apply(
    promoCode: PromoCode,
    card: Card,
    carWashId: number,
    usage: number,
  ): Promise<any>;
  abstract create(promoCode: PromoCode): Promise<PromoCode>;
  abstract bindClient(promoCode: PromoCode, client: Client): Promise<any>;
  abstract findOneByCode(code: string): Promise<PromoCode>;
  abstract validateUsageByCard(cardId: number, id: number): Promise<boolean>;
  abstract findOneById(id: number): Promise<PromoCode>;
  abstract findByUserAndActive(clientId: number): Promise<PromoCode[]>;
  abstract findMaxUsageByCard(cardId: number, id: number): Promise<any>;
}
