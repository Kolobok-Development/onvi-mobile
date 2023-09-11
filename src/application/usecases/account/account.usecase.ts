import { Injectable } from '@nestjs/common';
import { IAccountRepository } from '../../../domain/account/interface/account-repository.interface';
import { IDate } from '../../../infrastructure/common/interfaces/date.interface';
import { CardHist } from '../../../domain/account/card/model/cardHist';
import { Client } from '../../../domain/account/client/model/client';
import { AccountNotFoundExceptions } from '../../../domain/account/exceptions/account-not-found.exceptions';
import { TariffResponseDto } from './dto/tariff-response.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountUsecase {
  constructor(
    private readonly accountRepository: IAccountRepository,
    private readonly dateService: IDate,
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

    if (updatedClient) throw new AccountNotFoundExceptions(client.correctPhone);

    return updatedClient;
  }
}
