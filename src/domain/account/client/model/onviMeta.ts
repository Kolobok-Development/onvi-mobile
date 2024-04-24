import {ICreateMetaDto} from "../dto/create-meta.dto";
import {MetadataEntity} from "../../../../infrastructure/account/entity/metadata.entity";

export class OnviMeta {
    metaId?: number;
    clientId: number;
    deviceId: string;
    model: string;
    name: string;
    platform: string;
    platformVersion: string;
    manufacturer: string;
    appToken: string;

    private constructor(
        clientId: number,
        deviceId: string,
        model: string,
        name: string,
        platform: string,
        platformVersion: string,
        manufacturer: string,
        appToken: string,
        {
            metaId,
        }: {
            metaId: number;
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
    }

    public static create(data: ICreateMetaDto): OnviMeta {
        const { metaId, clientId, deviceId, model, name,  platform, platformVersion, manufacturer, appToken } = data;
        return new OnviMeta(clientId, deviceId, model, name, platform, platformVersion, manufacturer, appToken, { metaId });
    }

    public static fromEntity(entity: MetadataEntity): OnviMeta {
        const {
            metaId,
            clientId,
            deviceId,
            model,
            name,
            platform,
            platformVersion,
            manufacturer,
            appToken,
        } = entity;

        return new OnviMeta(clientId, deviceId, model, name, platform, platformVersion, manufacturer, appToken, { metaId });
    }
}