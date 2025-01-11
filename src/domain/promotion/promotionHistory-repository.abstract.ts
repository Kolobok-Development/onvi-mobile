import {Card} from "../account/card/model/card";
import {PromotionHist} from "./model/promotionHist";

export abstract class IPromotionHistoryRepository {
    abstract getPromotionHistory(card: Card): Promise<PromotionHist[]>;
}