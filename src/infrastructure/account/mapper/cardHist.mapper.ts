import {CardHistEntity} from "../entity/card-hist.enity";
import {CardHist} from "../../../domain/account/card/model/cardHist";

export class CardHistMapper {
    static fromEntity(cardHistEntity: CardHistEntity): CardHist {
        const {
            unqCardNumber,
            name,
            phone,
            operDate,
            operSum,
            operSumReal,
            operSumPoint,
            cashBackAmount,
            carWash,
            address,
            city,
            bay,
        } = cardHistEntity;

        return new CardHist(
            unqCardNumber,
            name,
            phone,
            operDate,
            operSum,
            operSumReal,
            operSumPoint,
            cashBackAmount,
            carWash,
            bay,
            address,
            city,
        );
    }
}