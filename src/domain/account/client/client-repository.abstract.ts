import { Client } from './model/client';

export abstract class IClientRepository {
  abstract create(client: Client): Promise<Client>;
  abstract update(client: Client): Promise<Client>;
  abstract findOneByPhone(phone: string): Promise<Client>;
  abstract setRefreshToken(phone: string, token: string): Promise<void>;
}
