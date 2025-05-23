import {Injectable} from "@nestjs/common";
import {ICardHistoryRepository} from "../../../domain/account/card/cardHistory-repository.abstract";
import {InjectRepository} from "@nestjs/typeorm";
import {CardHistEntity} from "../entity/card-hist.enity";
import {Between, Repository} from "typeorm";
import {CardHist} from "../../../domain/account/card/model/cardHist";
import {CardHistMapper} from "../mapper/cardHist.mapper";
import {DeviceType} from "../../../domain/order/enum/device-type.enum";
import {OrderStatus} from "../../../domain/order/enum/order-status.enum";

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

    async findByDeviceTypeAndDate(
        unqNumber: string,
        startDate: Date,
        endDate: Date,
        deviceType: DeviceType,
        orderStatus: OrderStatus,
    ): Promise<CardHist[]> {
        const histEntities = await this.cardHistoryRepository.find({
            where: {
                unqCardNumber: unqNumber,
                bayType: deviceType,
                orderStatus: orderStatus,
                operDate: Between(startDate, endDate),
            },
            order: { operDate: 'DESC' },
        });

        return histEntities.map(CardHistMapper.fromEntity)
    }
}