import {MetadataEntity} from "../entity/metadata.entity";
import {OnviMeta} from "../../../domain/account/client/model/onviMeta";

export class MetaMapper {
    static fromEntity(entity: MetadataEntity): OnviMeta {
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

        return new OnviMeta(
            clientId,
            deviceId,
            model,
            name,
            platform,
            platformVersion,
            manufacturer,
            appToken,
            {
                metaId
            }
        );
    }
    static toMetaEntity(meta: OnviMeta): MetadataEntity {
        const metaEntity: MetadataEntity = new MetadataEntity();

        metaEntity.metaId = meta.metaId ? meta.metaId : null;
        metaEntity.clientId = meta.clientId;
        metaEntity.deviceId = meta.deviceId;
        metaEntity.model = meta.model;
        metaEntity.name = meta.name;
        metaEntity.platform = meta.platform;
        metaEntity.platformVersion = meta.platformVersion;
        metaEntity.manufacturer = meta.manufacturer;
        metaEntity.appToken = meta.appToken;

        return metaEntity;
    }
}