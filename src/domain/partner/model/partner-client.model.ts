import {PartnerClientEntity} from "../../../infrastructure/partner/entity/partner-client.entity";
import {PartnerClientCreateDto} from "../../../application/usecases/partner/dto/partner-client-create.dto";

export class PartnerClient {
    id?: number;
    metaData: JSON;
    createdAt: Date;
    updatedAt?: Date;

    private constructor(
        metaData: JSON,
        createdAt: Date,
        {
            id,
            updatedAt,
        }: {
            id?: number;
            updatedAt?: Date;
        },
    ) {
        this.metaData = metaData;
        this.createdAt = createdAt;
        this.id = id;
        this.updatedAt = updatedAt;
    }

    public static create(date: PartnerClientCreateDto) {
       const { metaData } = date;

        const createdAt: Date = new Date();
        const updatedAt: Date = new Date();

        return new PartnerClient(JSON.parse(metaData), createdAt, {updatedAt})
    }
    public static fromEntity(entity: PartnerClientEntity): PartnerClient {
        return new PartnerClient(
            JSON.parse(entity.metaData) as JSON,
            entity.createdAt,
            {
                id: entity.id,
                updatedAt: entity.updatedAt
            }
        )
    }
}