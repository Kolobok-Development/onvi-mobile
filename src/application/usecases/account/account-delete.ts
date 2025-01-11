import {Injectable} from "@nestjs/common";
import {UpdateClientUseCase} from "./account-client-update";
import {ICardRepository} from "../../../domain/account/card/card-repository.abstract";
import {Client} from "../../../domain/account/client/model/client";
import {AccountNotFoundExceptions} from "../../../domain/account/exceptions/account-not-found.exceptions";

@Injectable()
export class DeleteAccountUseCase {
    constructor(
        private readonly updateClientUseCase: UpdateClientUseCase,
        private readonly cardRepository: ICardRepository,
    ) {}

    async execute(client: Client): Promise<any> {
        await this.updateClientUseCase.execute({isActivated: 0}, client);
        const isDeleted = await this.cardRepository.delete(client.getCard().cardId);

        if (!isDeleted) {
            throw new AccountNotFoundExceptions(client.correctPhone);
        }

        return { message: 'Success' };
    }
}