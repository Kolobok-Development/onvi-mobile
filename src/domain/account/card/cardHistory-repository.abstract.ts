import {CardHist} from "./model/cardHist";

export abstract class ICardHistoryRepository {
    abstract getCardHistory(
        unqNumber: string,
        size: number,
        page: number,
    ): Promise<CardHist[]>;
}