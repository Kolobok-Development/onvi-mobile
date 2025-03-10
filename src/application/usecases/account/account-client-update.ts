import { Injectable } from '@nestjs/common';
import { IClientRepository } from '../../../domain/account/client/client-repository.abstract';
import { Client } from '../../../domain/account/client/model/client';
import { AvatarType } from '../../../domain/account/client/enum/avatar.enum';
import { AccountNotFoundExceptions } from '../../../domain/account/exceptions/account-not-found.exceptions';
import { AccountClientUpdateDto } from '../../../domain/dto/account-client-update.dto';

@Injectable()
export class UpdateClientUseCase {
  constructor(private readonly clientRepository: IClientRepository) {}

  async execute(
    input: AccountClientUpdateDto,
    client: Client,
  ): Promise<Client> {
    const { name, email, avatar, notification, isActivated } = input;

    // Handle avatar setting
    if (avatar !== undefined) {
      if (avatar === 1) {
        client.avatarOnvi = AvatarType.ONE;
      } else if (avatar === 2) {
        client.avatarOnvi = AvatarType.TWO;
      } else if (avatar === 3) {
        client.avatarOnvi = AvatarType.THREE;
      }
    }

    // Only update fields that are defined in the input
    if (name !== undefined) client.name = name;
    if (email !== undefined) client.email = email;
    if (isActivated !== undefined) client.isActivated = isActivated;

    // Handle notification setting
    if (notification !== undefined) {
      client.isNotifications = notification ? 1 : 0;
    }

    // Update the client
    const updatedClient = await this.clientRepository.update(client);

    // Check if update was successful
    if (!updatedClient) {
      throw new AccountNotFoundExceptions(client.correctPhone);
    }

    return updatedClient;
  }
}
