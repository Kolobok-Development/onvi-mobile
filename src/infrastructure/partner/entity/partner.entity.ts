import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {PartnerClientEntity} from "./partner-client.entity";

@Entity({ name: 'ONVI_PARTNER', synchronize: false })
export class PartnerEntity {
    @PrimaryGeneratedColumn({ name: 'ID' })
    id: number;

    @Column({ type: 'varchar2', length: 255, name: 'NAME' })
    name: string;

    @Column({ name: 'TYPE', type: 'varchar2', length: 255 })
    type: string;

    @Column({ name: 'STATUS', type: 'varchar2', length: 255 })
    status: string;

    @Column({ type: 'varchar2', length: 255, name: 'PARTNER_TOKEN' })
    partnerToken: string;

    @Column({ name: 'CREATED_AT', type: 'date' })
    createdAt: Date;

    @Column({ name: 'UPDATED_AT', type: 'date' })
    updatedAt: Date;

    @OneToMany(()=> PartnerClientEntity, (partnerClient) => partnerClient.partner)
    partnerClients: PartnerClientEntity[];
}