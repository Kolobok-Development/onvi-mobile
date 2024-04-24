import {Injectable} from "@nestjs/common";
import {IMetaRepositoryAbstract} from "../../../domain/account/client/meta-repository.abstract";
import {InjectRepository} from "@nestjs/typeorm";
import {MetadataEntity} from "../entity/metadata.entity";
import {Repository} from "typeorm";
import {OnviMeta} from "../../../domain/account/client/model/onviMeta";

@Injectable()
export class MetaRepository implements IMetaRepositoryAbstract {
    constructor(
        @InjectRepository(MetadataEntity)
        private readonly metadataRepository: Repository<MetadataEntity>
    ) {}

    async create(meta: OnviMeta): Promise<OnviMeta> {
        const metaEntity = MetaRepository.toMetaEntity(meta);
        const newMeta = await this.metadataRepository.save(metaEntity);
        return OnviMeta.fromEntity(newMeta);
    }

    async findOneById(metaId: number): Promise<OnviMeta> {
        const meta = await this.metadataRepository.findOne({
            where: {
                metaId: metaId,
            },
        });

        if (!meta) return null;
        return OnviMeta.fromEntity(meta);
    }

    async findOneByClientId(clientId: number): Promise<OnviMeta> {
        const meta = await this.metadataRepository.findOne({
            where: {
                clientId: clientId,
            },
        });

        if (!meta) return null;
        return OnviMeta.fromEntity(meta);
    }

    async update(meta: OnviMeta): Promise<any> {
        const metaEntity = MetaRepository.toMetaEntity(meta);
        const { metaId, ...updatedData } = metaEntity;

        const updatedMeta = await this.metadataRepository.update(
            {
                metaId: metaId,
            },
            updatedData,
        );

        if (!updatedMeta) return null;

        return updatedMeta;
    }

    public static toMetaEntity(meta: OnviMeta): MetadataEntity {
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