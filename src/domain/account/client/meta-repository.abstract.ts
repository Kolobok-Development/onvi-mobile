import { OnviMeta } from './model/onviMeta';

export abstract class IMetaRepositoryAbstract {
  abstract create(meta: OnviMeta): Promise<OnviMeta>;
  abstract update(meta: OnviMeta): Promise<OnviMeta>;
  abstract findOneById(id: number): Promise<OnviMeta>;
  abstract findOneByClientId(clientId: number): Promise<OnviMeta>;
}
