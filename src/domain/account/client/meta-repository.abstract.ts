import {OnviMeta} from "./model/onviMeta";
import {Client} from "./model/client";

export abstract class IMetaRepositoryAbstract {
    abstract create(meta: OnviMeta, client: Client): Promise<OnviMeta>;
    abstract update(meta: OnviMeta): Promise<OnviMeta>;
    abstract findOneById(id: number): Promise<OnviMeta>;
    abstract findOneByClientId(clientId: number): Promise<OnviMeta>;
}