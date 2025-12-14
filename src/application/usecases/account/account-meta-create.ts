import { Injectable } from '@nestjs/common';
import { IMetaRepositoryAbstract } from '../../../domain/account/client/meta-repository.abstract';
import { AccountCreateMetaDto } from '../../../api/dto/req/account-create-meta.dto';
import { OnviMeta } from '../../../domain/account/client/model/onviMeta';
import { MetaExistsExceptions } from '../../../domain/account/exceptions/meta-exists.exception';

@Injectable()
export class CreateMetaUseCase {
  constructor(private readonly metadataRepository: IMetaRepositoryAbstract) {}

  async execute(input: AccountCreateMetaDto): Promise<OnviMeta> {
    const checkMeta = await this.metadataRepository.findOneByClientId(
      input.clientId,
    );
    if (checkMeta) {
      throw new MetaExistsExceptions(input.clientId);
    }

    const meta: OnviMeta = OnviMeta.create({
      metaId: input.metaId,
      clientId: input.clientId,
      deviceId: input.deviceId,
      model: input.model,
      name: input.name,
      platform: input.platform,
      platformVersion: input.platformVersion,
      manufacturer: input.manufacturer,
      appToken: input.appToken,
    });

    return await this.metadataRepository.create(meta);
  }
}
