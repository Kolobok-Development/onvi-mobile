import { Injectable } from '@nestjs/common';
import { ICardHistoryRepository } from '../../domain/account/card/cardHistory-repository.abstract';
import { Client } from '../../domain/account/client/model/client';
import { CardHist } from '../../domain/account/card/model/cardHist';
import { FindMethodsMetaUseCase } from '../usecases/account/account-meta-find-methods';
import { TariffResponseDto } from '../../api/dto/res/tariff-response.dto';
import { ITariffRepository } from '../../domain/account/card/tariff-repository.abstract';
import { AccountNotFoundExceptions } from '../../domain/account/exceptions/account-not-found.exceptions';
import { Card } from '../../domain/account/card/model/card';
import { ICardRepository } from '../../domain/account/card/card-repository.abstract';

@Injectable()
export class CardService {
  constructor(
    private readonly cardHistoryRepository: ICardHistoryRepository,
    private readonly cardRepository: ICardRepository,
    private readonly findMethodsMetaUseCase: FindMethodsMetaUseCase,
    private readonly tariffRepository: ITariffRepository,
  ) {}

  async getCardTransactionsHistory(
    client: Client,
    size: number,
    page: number,
  ): Promise<CardHist[]> {
    const meta = await this.findMethodsMetaUseCase.getByClientId(
      client.clientId,
    );
    const mainAccount = client.getAccountInfo(meta);
    return await this.cardHistoryRepository.getCardHistory(
      mainAccount.cards.unqNumber,
      size,
      page,
    );
  }

  async getCardTariff(client: Client): Promise<TariffResponseDto> {
    const card = client.getCard();
    const tariff = await this.tariffRepository.findCardTariff(card);

    if (!tariff) throw new AccountNotFoundExceptions(client.correctPhone);

    return {
      cashBack: tariff.bonus,
    };
  }

  async getCardBalance(unqNumber: string): Promise<any> {
    const card: Card = await this.cardRepository.findOneByDevNomer(unqNumber);

    if (!card) return null;

    return {
      unqNumber: card.devNomer,
      balance: card.balance,
      onviBonusSum: card.realBalance,
      promoCodeSum: card.airBalance,
    };
  }
}
