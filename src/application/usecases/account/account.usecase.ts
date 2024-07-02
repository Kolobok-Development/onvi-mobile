import {Injectable} from '@nestjs/common';
import {IAccountRepository} from '../../../domain/account/interface/account-repository.interface';
import {IDate} from '../../../infrastructure/common/interfaces/date.interface';
import {CardHist} from '../../../domain/account/card/model/cardHist';
import {Client} from '../../../domain/account/client/model/client';
import {AccountNotFoundExceptions} from '../../../domain/account/exceptions/account-not-found.exceptions';
import {TariffResponseDto} from './dto/tariff-response.dto';
import {UpdateAccountDto} from './dto/update-account.dto';
import {PromotionHist} from '../../../domain/promotion/model/promotionHist';
import {UpdateMetaDto} from "./dto/update-meta.dto";
import {IMetaRepositoryAbstract} from "../../../domain/account/client/meta-repository.abstract";
import {MetaNotFoundExceptions} from "../../../domain/account/exceptions/meta-not-found.exception";
import {CreateMetaDto} from "./dto/create-meta.dto";
import {MetaExistsExceptions} from "../../../domain/account/exceptions/meta-exists.exception";
import {OnviMeta} from "../../../domain/account/client/model/onviMeta";
import {AvatarType} from "../../../domain/account/client/enum/avatar.enum";
import {UpdateAuthTokenDto} from "../../../api/account/dto/update-auth-token.dto";

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
    const { name, email, avatar, isNotifications } = body;

    let chAvatar = client.avatarOnvi;
    if (avatar === 1) {
      chAvatar = AvatarType.ONE
    } else if (avatar === 2) {
      chAvatar = AvatarType.TWO
    } else if (avatar === 3) {
      chAvatar = AvatarType.THREE
    }
    client.name = name ? name : client.name;
    client.email = email ? email : client.email;
    client.avatarOnvi = chAvatar;
    client.isNotifications = isNotifications ? isNotifications : client.isNotifications;

    const updatedClient = await this.accountRepository.update(client);

    if (!updatedClient)
      throw new AccountNotFoundExceptions(client.correctPhone);

    return updatedClient;
  }

  async updateAuthToken(body: UpdateAuthTokenDto, client: Client) {
    client.authToken = body.authToken;
    const updatedClient = await this.accountRepository.update(client);

    if (!updatedClient)
      throw new AccountNotFoundExceptions(client.correctPhone);

    return updatedClient;
  }

  async getPromotionHistory(client: Client): Promise<PromotionHist[]> {
    const card = client.getCard();
    return await this.accountRepository.getPromotionHistory(card);
  }

  async getMetaById(metaId: number){
    const meta = await this.metadataRepository.findOneById(metaId);
    if (!meta) {
      throw new MetaNotFoundExceptions(meta.metaId);
    }
    return meta;
  }

  async updateMeta(body: UpdateMetaDto, client: Client){
    const meta = await this.metadataRepository.findOneByClientId(client.clientId);
    if (!meta) {
      throw new MetaNotFoundExceptions(client.clientId);
    }
    const {
      deviceId,
      model,
      name,
      platform,
      platformVersion,
      manufacturer,
      appToken,
      isEmulator,
      mac,
    } = body;

    meta.deviceId = deviceId ? deviceId : meta.deviceId;
    meta.model = model ? model : meta.model;
    meta.name = name ? name : meta.name;
    meta.platform = platform ? platform : meta.platform;
    meta.platformVersion = platformVersion ? platformVersion : meta.platformVersion;
    meta.manufacturer = manufacturer ? manufacturer : meta.manufacturer;
    meta.appToken = appToken ? appToken : meta.appToken;
    meta.isEmulator = isEmulator ? isEmulator : meta.isEmulator;
    meta.mac = mac ? mac : meta.mac;

    return await this.metadataRepository.update(meta);
  }
}
