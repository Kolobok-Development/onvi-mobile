import {ClientEntity} from "../entity/client.entity";
import {CardEntity} from "../entity/card.entity";
import {CardMapper} from "./card.mapper";
import {Client} from "../../../domain/account/client/model/client";

export class ClientMapper {
    static fromEntity(entity: ClientEntity): Client {
        let cardModels;
        const {
            clientId,
            name,
            email,
            phone,
            correctPhone,
            birthday,
            insDate,
            updDate,
            clientTypeId,
            isActivated,
            userOnvi,
            isNotifications,
            avatarOnvi,
            activatedDate,
            genderId,
            refreshToken,
            cards,
        } = entity;

        if (cards) {
            cardModels = cards.map((cardEntity: CardEntity) =>
                CardMapper.fromEntity(cardEntity),
            );
        }
        return new Client(
            name,
            phone,
            correctPhone,
            clientTypeId,
            refreshToken,
            isActivated,
            userOnvi,
            isNotifications,
            avatarOnvi,
            {
                clientId,
                email,
                birthday,
                insDate,
                updDate,
                activationDate: activatedDate,
                genderId,
                cards: cardModels,
            },
        );
    }

    static toClientEntity(client: Client): ClientEntity {
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