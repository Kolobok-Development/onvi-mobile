import {ICreateMetaDto} from "../dto/create-meta.dto";
import {MetadataEntity} from "../../../../infrastructure/account/entity/metadata.entity";

export class OnviMeta {
    metaId?: number;
    clientId?: number;
    deviceId?: string;
    model?: string;
    name?: string;
    platform?: string;
    platformVersion?: string;
    manufacturer?: string;
    appToken?: string;
    isEmulator?: number;
    mac?: string;

    private constructor(
        {
            metaId,
            clientId,
            deviceId,
            model,
            name,
            platform,
            platformVersion,
            manufacturer,
            appToken,
            isEmulator,
            mac,
        }: {
            metaId?: number;
            clientId?: number;
            deviceId?: string;
            model?: string;
            name?: string;
            platform?: string;
            platformVersion?: string;
            manufacturer?: string;
            appToken?: string;
            isEmulator?: number;
            mac?: string;
        },
    ) {
        this.metaId = metaId;
        this.clientId = clientId;
        this.deviceId = deviceId;
        this.model = model;
        this.name = name;
        this.platform = platform;
        this.platformVersion = platformVersion;
        this.manufacturer = manufacturer;
        this.appToken =appToken;
        this.isEmulator = isEmulator;
        this.mac = mac;
    }

    public static create(data: ICreateMetaDto): OnviMeta {
        const { metaId, clientId, deviceId, model, name,  platform, platformVersion, manufacturer, appToken, isEmulator, mac } = data;
        return new OnviMeta({ metaId, clientId, deviceId, model, name, platform, platformVersion, manufacturer, appToken, isEmulator, mac });
    }

    public static fromEntity(entity: MetadataEntity): OnviMeta {
        const {
            metaId,
            client,
            deviceId,
            model,
            name,
            platform,
            platformVersion,
            manufacturer,
            appToken,
            isEmulator,
            mac,
        } = entity;

        return new OnviMeta({ metaId, deviceId, model, name, platform, platformVersion, manufacturer, appToken, isEmulator, mac });
    }
}