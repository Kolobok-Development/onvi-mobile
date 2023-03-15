import { Client } from '../model/client';

export interface IClientRepository {
  findOneById(id: number): Promise<Client>;
  findOneByPhone(phone: string): Promise<Client>;
  create(client: any): Promise<Client>;
  update(filter: any, data: any): Promise<Client>;
}
