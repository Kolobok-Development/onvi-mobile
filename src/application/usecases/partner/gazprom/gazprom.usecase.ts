import {HttpStatus, Injectable} from "@nestjs/common";
import {Client} from "../../../../domain/account/client/model/client";
import {IGazpromRepository,} from "../../../../domain/partner/gazprom/gazprom-repository.abstract";
import {IPartnerRepository} from "../../../../domain/partner/partner-repository.abstract";
import {PartnerClient} from "../../../../domain/partner/model/partner-client.model";
import {Partner} from "../../../../domain/partner/model/partner.model";
import {CustomHttpException} from "../../../../infrastructure/common/exceptions/custom-http.exception";
import {NotFoundException} from "../../../../infrastructure/common/exceptions/base.exceptions";
import {GazpromUpdateDto} from "../dto/gazprom-update.dto";

@Injectable()
export class GazpromUsecase {
    constructor(
        private readonly gazpromRepository: IGazpromRepository,
        private readonly partnerRepository: IPartnerRepository,
    ) {
    }

    async activationSession(user: Client): Promise<any> {

        const partner = await this.partnerRepository.findOneByName('Gazprom');
        const clientPartner = await this.partnerRepository.findPartnerClientByClientIdAndPartnerId(user.clientId, partner.id);
        if (clientPartner) {
            try {
                return await this.gazpromRepository.getSession(user.clientId)
            } catch (e) {}
        }
        const clientGazprom = {
            status: 'CREATED'
        }
        const partnerClient = PartnerClient.create({ metaData: JSON.stringify(clientGazprom)});
        await this.partnerRepository.apply(partnerClient, partner, user.clientId);
        return await this.gazpromRepository.registration(user.clientId, user.correctPhone);
    }

    async getSubscriptionData(user: Client): Promise<any> {
        const partner = await this.partnerRepository.findOneByName('Gazprom');
        const subscriptionData = await this.gazpromRepository.getSubscriptionData(user.clientId);
        const clientPartner = await this.partnerRepository.findPartnerClientByClientIdAndPartnerId(user.clientId, partner.id);
        clientPartner.metaData = JSON.parse(JSON.stringify(subscriptionData));
        return await this.partnerRepository.updatePartnerClient(clientPartner);
    }

    async updatePartnerData(user: Client, metaData: any): Promise<any> {
        return await this.gazpromRepository.updateData(user.clientId, metaData)
    }

    async updateClientData(input: GazpromUpdateDto, partner: Partner): Promise<any> {
        const { client, promotion, ...metaData} = input;
        const clientPartner = await this.partnerRepository.findPartnerClientByClientIdAndPartnerId(client.partner_user_id, partner.id);
        if (!clientPartner) {
            throw new NotFoundException(432, 'Client not found')
        }
        clientPartner.metaData = JSON.parse(JSON.stringify(metaData));
        await this.partnerRepository.updatePartnerClient(clientPartner);
    }

    async cancelClientData(input: GazpromUpdateDto, partner: Partner): Promise<any> {
        const clientPartner = await this.partnerRepository.findPartnerClientByClientIdAndPartnerId(input.client.partner_user_id, partner.id);
        if (!clientPartner) {
            throw new NotFoundException(432, 'Client not found')
        }
        const metaData = clientPartner.metaData ? JSON.parse(JSON.stringify(clientPartner.metaData)) : {};
        if (metaData.status !=='ACTIVE') {
            throw new NotFoundException(433, 'Lack of an active subscription')
        }
        const subscriptionData = {
            status: 'CANCEL'
        }
        clientPartner.metaData = JSON.parse(JSON.stringify(subscriptionData));
        await this.partnerRepository.updatePartnerClient(clientPartner);
    }
}