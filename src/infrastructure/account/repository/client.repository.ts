import { IClientRepository } from '../../../domain/account/client/client-repository.abstract';
import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientEntity } from '../entity/client.entity';
import { Repository } from 'typeorm';
import { Client } from '../../../domain/account/client/model/client';
import { ClientMapper } from '../mapper/client.mapper';
import { Logger } from 'nestjs-pino';


@Injectable()
export class ClientRepository implements IClientRepository {
  constructor(
    @InjectRepository(ClientEntity)
    private readonly clientRepository: Repository<ClientEntity>,
        @Inject(Logger) private readonly logger: Logger,
  ) {}

  async create(client: Client): Promise<Client> {
    const clientEntity = ClientMapper.toClientEntity(client);
    const newClient = await this.clientRepository.save(clientEntity);
    return ClientMapper.fromEntity(newClient);
  }

  async findOneById(id: number): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: {
        clientId: id,
      },
    });

    if (!client) return null;

    return ClientMapper.fromEntity(client);
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
    return ClientMapper.fromEntity(client);
  }

  async findOneOldClientByPhone(phone: string): Promise<Client> {
    const client = await this.clientRepository
      .createQueryBuilder('client')
      .leftJoin('client.cards', 'cards')
      .where('client.correctPhone = :phone', { phone })
      .select(['client', 'cards'])
      .andWhere('client.userOnvi IS NULL OR client.userOnvi != :userOnvi', { userOnvi: 1 })
      .orderBy('INS_DATE', 'DESC')
      .limit(1)
      .getOne();
  
      if (!client) return null;
      return ClientMapper.fromEntity(client);
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
    const clientEntity = ClientMapper.toClientEntity(client);
    const { clientId, ...updatedData } = clientEntity;

    this.logger.log({
      message: "Client repo update",
      clientId: clientId,
      updatedData: updatedData
    })

    const updatedClient = await this.clientRepository.update(
      {
        clientId: clientId,
      },
      updatedData,
    );

    if (!updatedClient) return null;

    return updatedClient;
  }
}
