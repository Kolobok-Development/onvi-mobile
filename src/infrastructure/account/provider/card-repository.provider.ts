import {Provider} from "@nestjs/common";
import {ICardRepository} from "../../../domain/account/card/card-repository.abstract";
import {CardRepository} from "../repository/card.repository";

export const CardRepositoryProvider: Provider = {
    provide: ICardRepository,
    useClass: CardRepository,
}