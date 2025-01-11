import {TariffEntity} from "../entity/tariff.entity";
import {Tariff} from "../../../domain/account/card/model/tariff";

export class TariffMapper{
    static fromEntity(tariffEntity: TariffEntity): Tariff {
        const { cardTypeId, name, code, bonus, createDate, countryCode } =
            tariffEntity;

        return new Tariff(cardTypeId, name, code, bonus, createDate, countryCode);
    }
}