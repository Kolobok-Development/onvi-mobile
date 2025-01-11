import {Injectable} from "@nestjs/common";
import {ICardHistoryRepository} from "../../../domain/account/card/cardHistory-repository.abstract";
import {InjectRepository} from "@nestjs/typeorm";
import {CardHistEntity} from "../entity/card-hist.enity";
import {Repository} from "typeorm";
import {CardHist} from "../../../domain/account/card/model/cardHist";
import {CardHistMapper} from "../mapper/cardHist.mapper";

@Injectable()
export class CardHistoryRepository implements ICardHistoryRepository {
    constructor(
        @InjectRepository(CardHistEntity)
        private readonly cardHistoryRepository: Repository<CardHistEntity>,
    ) {
    }

    async getCardHistory(
        unqNumber: string,
        size: number,
        page: number,
    ): Promise<CardHist[]> {
        const [hisotry, total] = await this.cardHistoryRepository.findAndCount({
            where: { unqCardNumber: unqNumber },
            order: { operDate: 'DESC' },
            take: size,
            skip: page,
        });

        if (hisotry.length == 0) return [];

        return hisotry.map((transaction, i) => CardHistMapper.fromEntity(transaction));
    }
}