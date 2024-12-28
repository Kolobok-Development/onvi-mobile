import {Client} from "../account/client/model/client";
import {Card} from "../account/card/model/card";
import {Promotion} from "../promotion/model/promotion.model";

export abstract class ITransactionRepository {
    abstract create(
        client: Client,
        card: Card,
        promotionPoint: string,
        expId: string,
    ): Promise<any>;
    abstract withdraw(
        deviceId: string,
        cardUnq: string,
        sum: string,
        pToken?: string,
    ): Promise<any>;
}