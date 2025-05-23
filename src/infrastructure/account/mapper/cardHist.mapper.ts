import {CardHistEntity} from "../entity/card-hist.enity";
import {CardHist} from "../../../domain/account/card/model/cardHist";
import {OrderStatus} from "../../../domain/order/enum/order-status.enum";

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
            bayType,
        } = cardHistEntity;


        const statusMappings: Record<string, OrderStatus> = {
            created: OrderStatus.CREATED,
            payment_processing: OrderStatus.PAYMENT_PROCESSING,
            waiting_payment: OrderStatus.WAITING_PAYMENT,
            payment_authorized: OrderStatus.PAYMENT_AUTHORIZED,
            payed: OrderStatus.PAYED,
            failed: OrderStatus.FAILED,
            completed: OrderStatus.COMPLETED,
            canceled: OrderStatus.CANCELED,
            refunded: OrderStatus.REFUNDED,
        };
        const orderStatus =
            statusMappings[cardHistEntity.orderStatus] || OrderStatus.CREATED;

        return new CardHist(
            unqCardNumber,
            name,
            phone,
            operDate,
            operSum,
            operSumReal,
            operSumPoint,
            orderStatus,
            cashBackAmount,
            carWash,
            bay,
            bayType,
            address,
            city,
        );
    }
}