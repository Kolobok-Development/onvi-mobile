import {PartnerTypeEnum} from "../../../infrastructure/partner/enum/partner-type.enum";
import {PartnerStatusEnum} from "../../../infrastructure/partner/enum/partner-status.enum";
import {PartnerEntity} from "../../../infrastructure/partner/entity/partner.entity";
import {PartnerCreateDto} from "../../../application/usecases/partner/dto/partner-create.dto";
import { randomBytes } from 'crypto';

export class Partner {
    id?: number;
    name: string;
    type: PartnerTypeEnum;
    status: PartnerStatusEnum;
    partnerToken?: string;
    createdAt: Date;
    updatedAt?: Date;

    private constructor(
        name: string,
        type: PartnerTypeEnum,
        status: PartnerStatusEnum,
        createdAt: Date,
        {
            id,
            partnerToken,
            updatedAt,
        }: {
            id?: number;
            partnerToken?: string;
            updatedAt?: Date;
        },
    ) {
        this.name = name;
        this.type = type;
        this.status = status;
        this.createdAt = createdAt;
        this.id = id;
        this.partnerToken = partnerToken;
        this.updatedAt = updatedAt;
    }

    public static create(date: PartnerCreateDto) {
        const {
            type,
            name,
            status,
        } = date;

        const createdAt: Date = new Date();
        const updatedAt: Date = new Date();
        const partnerToken = this.generateRandomString(150);

        return new Partner(name, type, status, createdAt, {partnerToken, updatedAt})
    }

    public static fromEntity(entity: PartnerEntity): Partner {
        return new Partner(
            entity.name,
            entity.type as PartnerTypeEnum,
            entity.status as PartnerStatusEnum,
            entity.createdAt,
            {
                id: entity.id,
                partnerToken: entity.partnerToken,
                updatedAt: entity.updatedAt
            }
        )
    }

    static generateRandomString(length: number): string {
        return randomBytes(length).toString('base64');
    }

}