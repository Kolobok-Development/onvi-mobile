import {Injectable} from "@nestjs/common";
import {IMetaRepositoryAbstract} from "../../../domain/account/client/meta-repository.abstract";
import {MetaNotFoundExceptions} from "../../../domain/account/exceptions/meta-not-found.exception";

@Injectable()
export class FindMethodsMetaUseCase {
    constructor(private readonly metadataRepository: IMetaRepositoryAbstract) {}

    async getById(input: number) {
        const meta = await this.metadataRepository.findOneById(input);
        if (!meta) {
            throw new MetaNotFoundExceptions(meta.metaId);
        }
        return meta;
    }

    async getByClientId(input: number) {
        return await this.metadataRepository.findOneByClientId(input);
    }
}