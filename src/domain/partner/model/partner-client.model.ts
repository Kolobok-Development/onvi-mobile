import { PartnerClientEntity } from '../../../infrastructure/partner/entity/partner-client.entity';
import { PartnerClientCreateDto } from '../../../application/usecases/partner/dto/partner-client-create.dto';

export class PartnerClient {
  id?: number;
  metaData: JSON;
  createdAt: Date;
  updatedAt?: Date;
  partnerUserId?: string;

  private constructor(
    metaData: JSON,
    createdAt: Date,
    {
      id,
      updatedAt,
      partnerUserId,
    }: {
      id?: number;
      updatedAt?: Date;
      partnerUserId?: string;
    },
  ) {
    this.metaData = metaData;
    this.createdAt = createdAt;
    this.id = id;
    this.updatedAt = updatedAt;
    this.partnerUserId = partnerUserId;
  }

  public static create(date: PartnerClientCreateDto) {
    const { metaData, partnerUserId } = date;

    const createdAt: Date = new Date();
    const updatedAt: Date = new Date();

    return new PartnerClient(JSON.parse(metaData), createdAt, {
      updatedAt,
      partnerUserId,
    });
  }
  public static fromEntity(entity: PartnerClientEntity): PartnerClient {
    return new PartnerClient(
      JSON.parse(entity.metaData) as JSON,
      entity.createdAt,
      {
        id: entity.id,
        updatedAt: entity.updatedAt,
        partnerUserId: entity.partnerUserId,
      },
    );
  }
}
