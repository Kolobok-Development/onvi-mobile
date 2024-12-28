import {Injectable} from "@nestjs/common";
import {IMetaRepositoryAbstract} from "../../../domain/account/client/meta-repository.abstract";
import {InjectRepository} from "@nestjs/typeorm";
import {MetadataEntity} from "../entity/metadata.entity";
import {Repository} from "typeorm";
import {OnviMeta} from "../../../domain/account/client/model/onviMeta";
import {MetaMapper} from "../mapper/meta.mapper";

@Injectable()
export class MetaRepository implements IMetaRepositoryAbstract {
    constructor(
        @InjectRepository(MetadataEntity)
        private readonly metadataRepository: Repository<MetadataEntity>
    ) {}

    async create(meta: OnviMeta): Promise<OnviMeta> {
        const metaEntity = MetaMapper.toMetaEntity(meta);
        const newMeta = await this.metadataRepository.save(metaEntity);
        return MetaMapper.fromEntity(newMeta);
    }

    async findOneById(metaId: number): Promise<OnviMeta> {
        const meta = await this.metadataRepository.findOne({
            where: {
                metaId: metaId,
            },
        });

        if (!meta) return null;
        return MetaMapper.fromEntity(meta);
    }

    async findOneByClientId(clientId: number): Promise<OnviMeta> {
        const meta = await this.metadataRepository.findOne({
            where: {
                clientId: clientId,
            },
        });

        if (!meta) return null;
        return MetaMapper.fromEntity(meta);
    }

    async update(meta: OnviMeta): Promise<any> {
        const metaEntity = MetaMapper.toMetaEntity(meta);
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
}