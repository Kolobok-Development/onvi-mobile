import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";

@Entity({ name: 'CRDCLIENT_ONVI_METADATA', synchronize: false })
export class MetadataEntity {
    @PrimaryGeneratedColumn({ name: 'ONVI_META_ID', type: 'number' })
    metaId: number;

    @Column({ name: 'CLIENT_ID', type: 'number' })
    clientId: number;

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
}