import { Injectable } from '@nestjs/common';
import { IAccountRepository } from '../../../domain/account/interface/account-repository.interface';
import { IDate } from '../../../infrastructure/common/interfaces/date.interface';
import { CardHist } from '../../../domain/account/card/model/cardHist';
import { Client } from '../../../domain/account/client/model/client';

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
}
