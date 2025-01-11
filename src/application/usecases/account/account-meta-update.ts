import {Injectable} from "@nestjs/common";
import {IMetaRepositoryAbstract} from "../../../domain/account/client/meta-repository.abstract";
import {AccountUpdateMetaDto} from "../../../api/dto/req/account-update-meta.dto";
import {OnviMeta} from "../../../domain/account/client/model/onviMeta";
import {MetaNotFoundExceptions} from "../../../domain/account/exceptions/meta-not-found.exception";

@Injectable()
export class UpdateMetaUseCase {
    constructor(private readonly metadataRepository: IMetaRepositoryAbstract) {}

    async execute(input: AccountUpdateMetaDto): Promise<OnviMeta> {
        const meta = await this.metadataRepository.findOneById(input.metaId);
        if (!meta) {
            throw new MetaNotFoundExceptions(input.metaId);
        }
        const {
            clientId,
            deviceId,
            model,
            name,
            platform,
            platformVersion,
            manufacturer,
            appToken,
        } = input;

        meta.clientId = clientId ? clientId : meta.clientId;
        meta.deviceId = deviceId ? deviceId : meta.deviceId;
        meta.model = model ? model : meta.model;
        meta.name = name ? name : meta.name;
        meta.platform = platform ? platform : meta.platform;
        meta.platformVersion = platformVersion
            ? platformVersion
            : meta.platformVersion;
        meta.manufacturer = manufacturer ? manufacturer : meta.manufacturer;
        meta.appToken = appToken ? appToken : meta.appToken;

        return await this.metadataRepository.update(meta);
    }
}