import {HttpStatus, Injectable} from "@nestjs/common";
import {Client} from "../../../../domain/account/client/model/client";
import {IGazpromRepository,} from "../../../../domain/partner/gazprom/gazprom-repository.abstract";
import {IPartnerRepository} from "../../../../domain/partner/partner-repository.abstract";
import {PartnerClient} from "../../../../domain/partner/model/partner-client.model";
import {Partner} from "../../../../domain/partner/model/partner.model";
import {CustomHttpException} from "../../../../infrastructure/common/exceptions/custom-http.exception";
import {NotFoundException} from "../../../../infrastructure/common/exceptions/base.exceptions";
import {GazpromUpdateDto} from "../dto/gazprom-update.dto";
import {GazpromUpdateOperDto} from "../../../../infrastructure/partner/gazprom/dto/gazprom-update-oper.dto";

@Injectable()
export class GazpromUsecase {
    constructor(
        private readonly gazpromRepository: IGazpromRepository,
        private readonly partnerRepository: IPartnerRepository,
    ) {
    }

    async reference(user: Client, reference: string): Promise<any> {
        const partner = await this.partnerRepository.findOneByName('Gazprom');
        const clientGazprom = {
            status: 'CREATED'
        }
        const partnerUserId = `m01-${user.clientId}`;
        const partnerClient = PartnerClient.create({ metaData: JSON.stringify(clientGazprom), partnerUserId: partnerUserId});
        await this.partnerRepository.apply(partnerClient, partner, user.clientId);
        return await this.gazpromRepository.reference(reference, partnerUserId, user.correctPhone);
    }

    async activationSession(user: Client): Promise<any> {

        const partner = await this.partnerRepository.findOneByName('Gazprom');
        const clientPartner = await this.partnerRepository.findPartnerClientByClientIdAndPartnerId(user.clientId, partner.id);
        if (clientPartner) {
            try {
                return await this.gazpromRepository.getSession(clientPartner.partnerUserId)
            } catch (e) {}
        }
        const clientGazprom = {
            status: 'CREATED'
        }
        const partnerUserId = `m01-${user.clientId}`;
        const partnerClient = PartnerClient.create({ metaData: JSON.stringify(clientGazprom), partnerUserId: partnerUserId});
        await this.partnerRepository.apply(partnerClient, partner, user.clientId);
        return await this.gazpromRepository.registration(partnerUserId, user.correctPhone);
    }

    async getSubscriptionData(user: Client): Promise<any> {
        const partner = await this.partnerRepository.findOneByName('Gazprom');
        const clientPartner = await this.partnerRepository.findPartnerClientByClientIdAndPartnerId(user.clientId, partner.id);
        const subscriptionData = await this.gazpromRepository.getSubscriptionData(clientPartner.partnerUserId);
        clientPartner.metaData = JSON.parse(JSON.stringify(subscriptionData));
        return await this.partnerRepository.updatePartnerClient(clientPartner);
    }

    async updatePartnerData(user: Client, metaData: GazpromUpdateOperDto): Promise<any> {
        const partner = await this.partnerRepository.findOneByName('Gazprom');
        const clientPartner = await this.partnerRepository.findPartnerClientByClientIdAndPartnerId(user.clientId, partner.id);
        return await this.gazpromRepository.updateData(clientPartner.partnerUserId, metaData)
    }

    async updateClientData(input: GazpromUpdateDto, partner: Partner): Promise<any> {
        const { client, promotion, ...metaData} = input;
        const clientPartner = await this.partnerRepository.findPartnerClientByPartnerUserIdAndPartnerId(client.partner_user_id, partner.id);
        if (!clientPartner) {
            throw new NotFoundException(432, 'Client not found')
        }
        clientPartner.metaData = JSON.parse(JSON.stringify(metaData));
        await this.partnerRepository.updatePartnerClient(clientPartner);
    }

    async cancelClientData(input: GazpromUpdateDto, partner: Partner): Promise<any> {
        const clientPartner = await this.partnerRepository.findPartnerClientByPartnerUserIdAndPartnerId(input.client.partner_user_id, partner.id);
        if (!clientPartner) {
            throw new NotFoundException(432, 'Client not found')
        }
        const metaData = clientPartner.metaData ? JSON.parse(JSON.stringify(clientPartner.metaData)) : {};
        if (metaData.status !=='ACTIVE' && metaData.status !=='active') {
            throw new NotFoundException(433, 'Lack of an active subscription')
        }
        const subscriptionData = {
            status: 'CANCEL'
        }
        clientPartner.metaData = JSON.parse(JSON.stringify(subscriptionData));
        await this.partnerRepository.updatePartnerClient(clientPartner);
    }
}