import {Injectable} from "@nestjs/common";
import {IPartnerRepository} from "../../../domain/partner/partner-repository.abstract";
import {InjectRepository} from "@nestjs/typeorm";
import {PartnerEntity} from "../entity/partner.entity";
import {Repository} from "typeorm";
import {PartnerClientEntity} from "../entity/partner-client.entity";
import {Partner} from "../../../domain/partner/model/partner.model";
import {PartnerClient} from "../../../domain/partner/model/partner-client.model";
import {Client} from "../../../domain/account/client/model/client";
import {ClientEntity} from "../../account/entity/client.entity";

@Injectable()
export class PartnerRepository implements IPartnerRepository{
    constructor(
        @InjectRepository(PartnerEntity)
        private readonly partnerRepository: Repository<PartnerEntity>,
        @InjectRepository(PartnerClientEntity)
        private readonly partnerClientRepository: Repository<PartnerClientEntity>,
    ) {}

    async create(partner: Partner): Promise<Partner> {
        const partnerEntity = this.toPartnerEntity(partner);
        const newPartnerEntity = await this.partnerRepository.save(partnerEntity);
        return Partner.fromEntity(newPartnerEntity);
    }

    async findOneById(id: number): Promise<Partner> {
        const partner = await this.partnerRepository.findOne({
            where: {
                id
            }
        });

        if (!partner) return null;

        return Partner.fromEntity(partner);
    }

    async findOneByName(name: string): Promise<Partner> {
        const partner = await this.partnerRepository.findOne({
            where: {
                name
            }
        });

        if (!partner) return null;

        return Partner.fromEntity(partner);
    }

    async findOneByToken(partnerToken: string): Promise<Partner> {
        const partner = await this.partnerRepository.findOne({
            where: {
                partnerToken
            }
        });

        if (!partner) return null;

        return Partner.fromEntity(partner);
    }

    async update(partner: Partner): Promise<any> {
        const partnerEntity = this.toPartnerEntity(partner);
        const { id, ...updateData} = partnerEntity;

        const updatePartner = await this.partnerRepository.update(
            {
                id: id,
            },
            updateData,
        )

        if (!updatePartner) return null;

        return updatePartner;
    }

    async apply(partnerClient: PartnerClient, partner: Partner, clientId: number): Promise<PartnerClient> {
        const partnerClientEntity = new PartnerClientEntity();

        partnerClientEntity.partner = { id: partner.id } as PartnerEntity;
        partnerClientEntity.client = { clientId: clientId } as ClientEntity;
        partnerClientEntity.metaData = JSON.stringify(partnerClient.metaData);
        partnerClientEntity.createdAt = partnerClient.createdAt;
        partnerClientEntity.updatedAt = partnerClient.updatedAt;

        const newPartnerClientEntity = await this.partnerClientRepository.save(partnerClientEntity);
        return PartnerClient.fromEntity(newPartnerClientEntity);
    }

    async findPartnerClientByClientIdAndPartnerId(clientId: number, partnerId: number): Promise<PartnerClient> {
        const partnerClient = await this.partnerClientRepository.findOne({
            where:{
                partner: { id: partnerId },
                client: { clientId}
            }
        });

        if (!partnerClient) return null;
        return PartnerClient.fromEntity(partnerClient);
    }

    async updatePartnerClient(partnerClient: PartnerClient): Promise<any> {
        const partnerClientEntity = new PartnerClientEntity();

        partnerClientEntity.id = partnerClient.id;
        partnerClientEntity.metaData = JSON.stringify(partnerClient.metaData);
        partnerClientEntity.createdAt = partnerClient.createdAt;
        partnerClientEntity.updatedAt = partnerClient.updatedAt;

        const { id, ...updateData} = partnerClientEntity;

        const updatePartnerClient = await this.partnerClientRepository.update(
            {
                id: id,
            },
            updateData
        )
        if (!updatePartnerClient) return null;

        return updatePartnerClient;
    }

    private toPartnerEntity(partner: Partner): PartnerEntity {
        const partnerEntity = new PartnerEntity();

        partnerEntity.id = partner.id;
        partnerEntity.name = partner.name;
        partnerEntity.type = partner.type;
        partnerEntity.status = partner.status;
        partnerEntity.partnerToken = partner.partnerToken;
        partnerEntity.createdAt = partner.createdAt;
        partnerEntity.updatedAt = partner.updatedAt;

        return partnerEntity;
    }

}