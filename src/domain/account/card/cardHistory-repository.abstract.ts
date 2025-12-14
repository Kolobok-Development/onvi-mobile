import { CardHist } from './model/cardHist';
import { DeviceType } from '../../order/enum/device-type.enum';
import { OrderStatus } from '../../order/enum/order-status.enum';

export abstract class ICardHistoryRepository {
  abstract getCardHistory(
    unqNumber: string,
    size: number,
    page: number,
  ): Promise<CardHist[]>;
  abstract findByDeviceTypeAndDate(
    unqNumber: string,
    startDate: Date,
    endDate: Date,
    deviceType: DeviceType,
    orderStatus: OrderStatus,
  ): Promise<CardHist[]>;
}
