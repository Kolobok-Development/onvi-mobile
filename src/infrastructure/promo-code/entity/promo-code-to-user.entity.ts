import {Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {PromoCodeEntity} from "./promocode.entity";
import {ClientEntity} from "../../account/entity/client.entity";

@Entity({ name: 'MOBILE_PROMO_CODE_TO_USER', synchronize: false })
export class PromoCodeToUserEntity {
    @PrimaryGeneratedColumn({ name: 'ID' })
    id: number;

    @ManyToOne(() => PromoCodeEntity, (promoCode) => promoCode.user)
    @JoinColumn({ name: 'PROMO_CODE_ID', referencedColumnName: 'id' })
    promoCode: PromoCodeEntity;

    @ManyToOne(() => ClientEntity, (client) => client.promoCodes)
    @JoinColumn({ name: 'USER_ID', referencedColumnName: 'clientId' })
    client: ClientEntity;
}