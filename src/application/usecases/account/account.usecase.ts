import { Injectable } from '@nestjs/common';
import { IAccountRepository } from '../../../domain/account/interface/account-repository.interface';
import { IDate } from '../../../infrastructure/common/interfaces/date.interface';
import { CardHist } from '../../../domain/account/card/model/cardHist';
import { Client } from '../../../domain/account/client/model/client';
import { AccountNotFoundExceptions } from '../../../domain/account/exceptions/account-not-found.exceptions';
import { TariffResponseDto } from './dto/tariff-response.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { PromotionHist } from '../../../domain/promotion/model/promotionHist';
import { UpdateMetaDto } from './dto/update-meta.dto';
import { IMetaRepositoryAbstract } from '../../../domain/account/client/meta-repository.abstract';
import { MetaNotFoundExceptions } from '../../../domain/account/exceptions/meta-not-found.exception';
import { CreateMetaDto } from './dto/create-meta.dto';
import { MetaExistsExceptions } from '../../../domain/account/exceptions/meta-exists.exception';
import { OnviMeta } from '../../../domain/account/client/model/onviMeta';
import { AvatarType } from '../../../domain/account/client/enum/avatar.enum';
import { IPromoCodeRepository } from '../../../domain/promo-code/promo-code-repository.abstract';
import { Card } from '../../../domain/account/card/model/card';

@Injectable()
export class AccountUsecase {
  constructor(
    private readonly accountRepository: IAccountRepository,
    private readonly dateService: IDate,
    private readonly metadataRepository: IMetaRepositoryAbstract,
    private readonly promoCodeRepository: IPromoCodeRepository,
  ) {}

  async getCardTransactionsHistory(
    client: Client,
    size: number,
    page: number,
  ): Promise<CardHist[]> {
    const meta = await this.metadataRepository.findOneByClientId(
      client.clientId,
    );
    const mainAccount = client.getAccountInfo(meta);
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

  async getCardBalance(unqNumber: string): Promise<any> {
    const card: Card = await this.accountRepository.findOneByDevNomer(
      unqNumber,
    );

    if (!card) return null;

    return {
      unqNumber: card.devNomer,
      balance: card.balance,
      onviBonusSum: card.realBalance,
      promoCodeSum: card.airBalance,
    };
  }


//  aysync transfetBalance(client: Client,  )

  async updateAccountInfo(body: UpdateAccountDto, client: Client) {
    const { name, email, avatar } = body;

    let chAvatar = client.avatarOnvi;
    if (avatar === 1) {
      chAvatar = AvatarType.ONE;
    } else if (avatar === 2) {
      chAvatar = AvatarType.TWO;
    } else if (avatar === 3) {
      chAvatar = AvatarType.THREE;
    }
    client.name = name ? name : client.name;
    client.email = email ? email : client.email;
    client.avatarOnvi = chAvatar;

    const updatedClient = await this.accountRepository.update(client);

    if (!updatedClient)
      throw new AccountNotFoundExceptions(client.correctPhone);

    return updatedClient;
  }

  async updateNotification(notification: boolean, client: Client) {
    let updatedClient: any;
    if (notification) {
      client.isNotifications = 1;
      updatedClient = await this.accountRepository.update(client);
    } else {
      client.isNotifications = 0;
      updatedClient = await this.accountRepository.update(client);
    }
    return updatedClient;
  }

  async getPromotionHistory(client: Client): Promise<PromotionHist[]> {
    const card = client.getCard();
    return await this.accountRepository.getPromotionHistory(card);
  }

  async getActivePromotionHistoryForClient(client: Client) {
    return await this.promoCodeRepository.findByUserAndActive(client.clientId);
  }

  async createMeta(body: CreateMetaDto) {
    const checkMeta = await this.metadataRepository.findOneByClientId(
      body.clientId,
    );
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
    });

    return await this.metadataRepository.create(meta);
  }
  async getMetaById(metaId: number) {
    const meta = await this.metadataRepository.findOneById(metaId);
    if (!meta) {
      throw new MetaNotFoundExceptions(meta.metaId);
    }
    return meta;
  }

  async getMetaByClientId(clientId: number) {
    return await this.metadataRepository.findOneByClientId(clientId);
  }

  async updateMeta(body: UpdateMetaDto) {
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
    meta.platformVersion = platformVersion
      ? platformVersion
      : meta.platformVersion;
    meta.manufacturer = manufacturer ? manufacturer : meta.manufacturer;
    meta.appToken = appToken ? appToken : meta.appToken;

    return await this.metadataRepository.update(meta);
  }

  async deleteAccount(client: Client): Promise<any> {
    client.isActivated = 0;
    const isDeleted = await this.accountRepository.delete(client);

    if (!isDeleted) {
      throw new AccountNotFoundExceptions(client.correctPhone);
    }

    return { message: 'Success' };
  }
}
