import { Client } from './model/client';
import { OnviMeta } from './model/onviMeta';

export abstract class IClientRepository {
  abstract create(client: Client): Promise<Client>;
  abstract findOneById(id: number): Promise<Client>;
  abstract update(client: Client): Promise<Client>;
  abstract findOneByPhone(phone: string): Promise<Client>;
  abstract findOneOldClientByPhone(phone: string): Promise<Client>;
  abstract setRefreshToken(phone: string, token: string): Promise<void>;
}
