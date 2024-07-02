import {Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {ClientEntity} from "./client.entity";

@Entity({ name: 'CRDCLIENT_ONVI_METADATA', synchronize: false })
export class MetadataEntity {
    @PrimaryGeneratedColumn({ name: 'ONVI_META_ID', type: 'number' })
    metaId: number;

    @OneToOne(() => ClientEntity, (client: ClientEntity) => client.meta)
    @JoinColumn({name: 'CLIENT_ID'})
    client: ClientEntity;

    @Column({ name: 'DEVICE_ID', type: 'nvarchar2' })
    deviceId: string;

    @Column({ name: 'MODEL', type: 'nvarchar2' })
    model: string;

    @Column({ name: 'NAME', type: 'nvarchar2' })
    name: string;

    @Column({ name: 'PLATFORM', type: 'nvarchar2' })
    platform: string;

    @Column({ name: 'PLATFORM_VERSION', type: 'nvarchar2' })
    platformVersion: string;

    @Column({ name: 'MANUFACTURER', type: 'nvarchar2' })
    manufacturer: string;

    @Column({ name: 'APP_TOKEN', type: 'nvarchar2' })
    appToken: string;

    @Column({ name: 'MAC', type: 'nvarchar2' })
    mac: string;

    @Column({ name: 'IS_EMULATOR', type: 'number' })
    isEmulator: number;
}