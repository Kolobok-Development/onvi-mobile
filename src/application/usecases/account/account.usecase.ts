import { Injectable } from '@nestjs/common';
import { IAccountRepository } from '../../../domain/account/interface/account-repository.interface';
import { IDate } from '../../../infrastructure/common/interfaces/date.interface';
import { CardHist } from '../../../domain/account/card/model/cardHist';
import { Client } from '../../../domain/account/client/model/client';
import { AccountNotFoundExceptions } from '../../../domain/account/exceptions/account-not-found.exceptions';
import { TariffResponseDto } from './dto/tariff-response.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { IPromotionRepository } from '../../../domain/promotion/promotion-repository.abstract';
import { PromotionHist } from '../../../domain/promotion/model/promotionHist';
import {UpdateMetaDto} from "./dto/update-meta.dto";
import {IMetaRepositoryAbstract} from "../../../domain/account/client/meta-repository.abstract";
import {MetaNotFoundExceptions} from "../../../domain/account/exceptions/meta-not-found.exception";
import {CreateMetaDto} from "./dto/create-meta.dto";
import {MetaExistsExceptions} from "../../../domain/account/exceptions/meta-exists.exception";
import {OnviMeta} from "../../../domain/account/client/model/onviMeta";

@Injectable()
export class AccountUsecase {
  constructor(
    private readonly accountRepository: IAccountRepository,
    private readonly dateService: IDate,
    private readonly metadataRepository: IMetaRepositoryAbstract,
  ) {}

  async getCardTransactionsHistory(
    client: Client,
    size: number,
    page: number,
  ): Promise<CardHist[]> {
    const mainAccount = client.getAccountInfo();
    return await this.accountRepository.getCardHistory(
      mainAccount.cards.unqNumber,
      size,
      page,
    );
  }

  async getCardTariff(client: Client): Promise<TariffResponseDto> {
    const card = client.getCard();
    const tariff = await this.accountRepository.findCardTariff(card);

    if (!tariff) throw new AccountNotFoundExceptions(client.correctPhone);

    return {
      cashBack: tariff.bonus,
    };
  }

  async updateAccountInfo(body: UpdateAccountDto, client: Client) {
    const { name, email } = body;

    client.name = name ? name : client.name;
    client.email = email ? email : client.email;

    const updatedClient = await this.accountRepository.update(client);

    if (!updatedClient)
      throw new AccountNotFoundExceptions(client.correctPhone);

    return updatedClient;
  }

  async getPromotionHistory(client: Client): Promise<PromotionHist[]> {
    const card = client.getCard();
    return await this.accountRepository.getPromotionHistory(card);
  }

  async createMeta(body: CreateMetaDto){
    const checkMeta = await this.metadataRepository.findOneByClientId(body.clientId);
    if (checkMeta) {
      throw new MetaExistsExceptions(body.clientId);
    }

    const meta: OnviMeta = OnviMeta.create({
      metaId: body.metaId,
      clientId: body.clientId,
      deviceId: body.deviceId,
      model: body.model,
      name: body.name,
      platform: body.platform,
      platformVersion: body.platformVersion,
      manufacturer: body.manufacturer,
      appToken: body.appToken,
    })

    return await this.metadataRepository.create(meta);
  }
  async getMetaById(metaId: number){
    const meta = await this.metadataRepository.findOneById(metaId);
    if (!meta) {
      throw new MetaNotFoundExceptions(meta.metaId);
    }
    return meta;
  }

  async updateMeta(body: UpdateMetaDto){
    const meta = await this.metadataRepository.findOneById(body.metaId);
    if (!meta) {
      throw new MetaNotFoundExceptions(body.metaId);
    }
    const {
      clientId,
      deviceId,
      model,
      name,
      platform,
      platformVersion,
      manufacturer,
      appToken,
    } = body;

    meta.clientId = clientId ? clientId : meta.clientId;
    meta.deviceId = deviceId ? deviceId : meta.deviceId;
    meta.model = model ? model : meta.model;
    meta.name = name ? name : meta.name;
    meta.platform = platform ? platform : meta.platform;
    meta.platformVersion = platformVersion ? platformVersion : meta.platformVersion;
    meta.manufacturer = manufacturer ? manufacturer : meta.manufacturer;
    meta.appToken = appToken ? appToken : meta.appToken;

    return await this.metadataRepository.update(meta);
  }
}
