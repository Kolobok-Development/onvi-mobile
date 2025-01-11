import {Injectable} from "@nestjs/common";
import {IClientRepository} from "../../../domain/account/client/client-repository.abstract";
import {Client} from "../../../domain/account/client/model/client";
import {AvatarType} from "../../../domain/account/client/enum/avatar.enum";
import {AccountNotFoundExceptions} from "../../../domain/account/exceptions/account-not-found.exceptions";
import {AccountClientUpdateDto} from "../../../domain/dto/account-client-update.dto";

@Injectable()
export class UpdateClientUseCase {
    constructor(private readonly clientRepository: IClientRepository) {}

    async execute(input: AccountClientUpdateDto, client: Client): Promise<Client> {
        const {
            name,
            email,
            avatar,
            notification,
            isActivated
        } = input;

        let chAvatar = client.avatarOnvi;
        if (avatar === 1) {
            chAvatar = AvatarType.ONE;
        } else if (avatar === 2) {
            chAvatar = AvatarType.TWO;
        } else if (avatar === 3) {
            chAvatar = AvatarType.THREE;
        }

        client.name = name ? name : client.name;
        client.email = email ? email : client.email;
        client.isActivated = isActivated ? isActivated : client.isActivated;
        client.avatarOnvi = chAvatar;
        if (input.notification !== undefined) {
            client.isNotifications = notification ? 1 : 0;
        }

        const updatedClient = await this.clientRepository.update(client);

        if (!updatedClient)
            throw new AccountNotFoundExceptions(client.correctPhone);

        return updatedClient;
    }
}