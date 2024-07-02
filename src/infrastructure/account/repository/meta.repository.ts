import {Injectable} from "@nestjs/common";
import {IMetaRepositoryAbstract} from "../../../domain/account/client/meta-repository.abstract";
import {InjectRepository} from "@nestjs/typeorm";
import {MetadataEntity} from "../entity/metadata.entity";
import {Repository} from "typeorm";
import {OnviMeta} from "../../../domain/account/client/model/onviMeta";
import {Client} from "../../../domain/account/client/model/client";
import {ClientRepository} from "./client.repository";

@Injectable()
export class MetaRepository implements IMetaRepositoryAbstract {
    constructor(
        @InjectRepository(MetadataEntity)
        private readonly metadataRepository: Repository<MetadataEntity>
    ) {}

    async create(meta: OnviMeta, client: Client): Promise<OnviMeta> {
        const metaEntity = MetaRepository.toMetaEntity(meta);
        metaEntity.client = ClientRepository.toClientEntity(client);
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
        const meta = await this.metadataRepository
            .createQueryBuilder('meta')
            .leftJoin('meta.client', 'client')
            .where('client.clientId = :clientId', { clientId }).getOne();

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
        metaEntity.deviceId = meta.deviceId;
        metaEntity.client
        metaEntity.model = meta.model;
        metaEntity.name = meta.name;
        metaEntity.platform = meta.platform;
        metaEntity.platformVersion = meta.platformVersion;
        metaEntity.manufacturer = meta.manufacturer;
        metaEntity.appToken = meta.appToken;
        metaEntity.mac = meta.mac;
        metaEntity.isEmulator = meta.isEmulator;

        return metaEntity;
    }
}