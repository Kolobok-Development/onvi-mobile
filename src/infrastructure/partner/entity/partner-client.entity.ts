import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClientEntity } from '../../account/entity/client.entity';
import { PartnerEntity } from './partner.entity';

@Entity({ name: 'ONVI_PARTNER_CLIENT', synchronize: false })
export class PartnerClientEntity {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id: number;

  @ManyToOne(() => PartnerEntity, (partner) => partner.partnerClients)
  @JoinColumn({ name: 'PARTNER_ID', referencedColumnName: 'id' })
  partner: PartnerEntity;

  @ManyToOne(() => ClientEntity, (client) => client.partners)
  @JoinColumn({ name: 'CLIENT_ID', referencedColumnName: 'clientId' })
  client: ClientEntity;

  @Column({ name: 'META_DATA', type: 'varchar2', length: 1000 })
  metaData: string;

  @Column({ name: 'CREATED_AT', type: 'date' })
  createdAt: Date;

  @Column({ name: 'UPDATED_AT', type: 'date' })
  updatedAt: Date;

  @Column({ name: 'PARTNER_USER_ID', type: 'varchar2', length: 255 })
  partnerUserId: string;
}
