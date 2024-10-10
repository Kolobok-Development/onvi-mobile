import { IClientRepository } from '../../../domain/account/client/client-repository.abstract';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientEntity } from '../entity/client.entity';
import { Repository } from 'typeorm';
import { Client } from '../../../domain/account/client/model/client';

@Injectable()
export class ClientRepository implements IClientRepository {
  constructor(
    @InjectRepository(ClientEntity)
    private readonly clientRepository: Repository<ClientEntity>,
  ) {}

  async create(client: Client): Promise<Client> {
    const clientEntity = ClientRepository.toClientEntity(client);
    const newClient = await this.clientRepository.save(clientEntity);
    return Client.fromEntity(newClient);
  }

  async findOneByPhone(phone: string): Promise<Client> {
    const client = await this.clientRepository
      .createQueryBuilder('client')
      .leftJoin('client.cards', 'cards')
      .where('client.correctPhone = :phone', { phone: phone })
      .select(['client', 'cards'])
      .andWhere('client.userOnvi = :userOnvi', { userOnvi: 1 })
      .orderBy('INS_DATE', 'DESC')
      .limit(1)
      .getOne();

    if (!client) return null;
    return Client.fromEntity(client);
  }

  async setRefreshToken(phone: string, token: string): Promise<void> {
    const client: Client = await this.findOneByPhone(phone);

    if (!client) {
      return null;
    }

    client.refreshToken = token;

    await this.clientRepository.save(client);
  }

  async update(client: Client): Promise<any> {
    const clientEntity = ClientRepository.toClientEntity(client);
    const { clientId, ...updatedData } = clientEntity;

    const updatedClient = await this.clientRepository.update(
      {
        clientId: clientId,
      },
      updatedData,
    );

    if (!updatedClient) return null;

    return updatedClient;
  }

  public static toClientEntity(client: Client): ClientEntity {
    const clientEntity: ClientEntity = new ClientEntity();

    clientEntity.clientId = client.clientId ? client.clientId : null;
    clientEntity.name = client.name;
    clientEntity.email = client.email;
    clientEntity.phone = client.phone;
    clientEntity.birthday = client.birthday;
    clientEntity.clientTypeId = client.clientTypeId;
    clientEntity.isActivated = client.isActivated;
    clientEntity.genderId = client.genderId;
    clientEntity.correctPhone = client.correctPhone;
    clientEntity.refreshToken = client.refreshToken;
    clientEntity.activatedDate = client.activatedDate;
    clientEntity.userOnvi = client.userOnvi;
    clientEntity.avatarOnvi = client.avatarOnvi;
    clientEntity.isNotifications = client.isNotifications;

    return clientEntity;
  }
}
