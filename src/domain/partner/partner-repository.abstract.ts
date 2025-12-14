import { Partner } from './model/partner.model';
import { PartnerClient } from './model/partner-client.model';
import { Client } from '../account/client/model/client';

export abstract class IPartnerRepository {
  abstract create(partner: Partner): Promise<Partner>;
  abstract findOneById(partnerId: number): Promise<Partner>;
  abstract findOneByName(name: string): Promise<Partner>;
  abstract findOneByToken(partnerToken: string): Promise<Partner>;
  abstract update(partner: Partner): Promise<any>;
  abstract apply(
    partnerClient: PartnerClient,
    partner: Partner,
    clientId: number,
  ): Promise<PartnerClient>;
  abstract findPartnerClientByClientIdAndPartnerId(
    clientId: number,
    partnerId: number,
  ): Promise<PartnerClient>;
  abstract findPartnerClientByPartnerUserIdAndPartnerId(
    partnerUserId: string,
    partnerId: number,
  ): Promise<PartnerClient>;
  abstract updatePartnerClient(partnerClient: PartnerClient): Promise<any>;
}
