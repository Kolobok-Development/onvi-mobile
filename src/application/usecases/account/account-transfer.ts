import { Injectable, Inject, UseGuards } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
//import { ThrottlerGuard } from '@nestjs/throttler';
//import { ThrottleType } from '../../../infrastructure/common/decorators/throttler.decorator';
import { Client } from '../../../domain/account/client/model/client';
import { FindMethodsCardUseCase } from './account-card-find-methods';
import { ICardRepository } from '../../../domain/account/card/card-repository.abstract';
import { CardNotMatchExceptions } from '../../../domain/account/exceptions/card-not-match.exceptions';
import { AccountTransferDataResponseDto } from '../../../api/dto/res/account-transfer-data.dto';
import { AccountTransferDto } from '../../../api/dto/req/account-transfer.dto';
import { ITransactionRepository } from '../../../domain/transaction/transaction-repository.abstract';
import { PromoCode } from '../../../domain/promo-code/model/promo-code.model';
import { PromocodeUsecase } from '../promocode/promocode.usecase';
import { IClientRepository } from '../../../domain/account/client/client-repository.abstract';
import { PhoneNumbersDoNotMatch } from 'src/domain/account/exceptions/phone-numbers-do-not-match';

@Injectable()
export class AccountTransferUseCase {
  constructor(
    private readonly findMethodsCardUseCase: FindMethodsCardUseCase,
    private readonly cardRepository: ICardRepository,
    private readonly transactionRepository: ITransactionRepository,
    private readonly promoCodeUsecase: PromocodeUsecase,
    private readonly clientRepository: IClientRepository,
    @Inject(Logger) private readonly logger: Logger,
  ) { }

  async transferData(
    devNomer: string,
    client: Client,
  ): Promise<AccountTransferDataResponseDto> {
    const card = await this.findMethodsCardUseCase.getOneByDevNomer(devNomer);
    if (!card) {
      throw new CardNotMatchExceptions(devNomer);
    }
    const groupId = await this.cardRepository.findGroupIdByCardId(card.cardId);
    if (groupId != 3 || card.isDel === 1 || card.isLocked === 1) {
      throw new CardNotMatchExceptions(devNomer);
    }
    return {
      cardId: card.cardId,
      realBalance: card.realBalance,
      airBalance: card.airBalance,
    };
  }

  async transfer(input: AccountTransferDto, client: Client): Promise<any> {
    this.logger.log(
      {
        action: 'balance_transfer_initiated',
        timestamp: new Date(),
        clientId: client.clientId,
        details: JSON.stringify({
          devNomer: input.devNomer,
          realBalance: input.realBalance,
          airBalance: input.airBalance,
        }),
      },
      `Balance transfer initiated for client ${client.clientId} from card ${input.devNomer}`,
    );
    //возвращает объект card без поля clientId
    const card = await this.findMethodsCardUseCase.getOneByDevNomerWithUserId(
      input.devNomer,
    );

    const oldClient = await this.clientRepository.findOneById(card.clientId);

    if (oldClient.phone !== client.phone) {
      this.logger.warn(
        {
          action: 'balance_transfer_failed',
          timestamp: new Date(),
          clientId: client.clientId,
          details: JSON.stringify({
            devNomer: input.devNomer,
            reason: 'Client phone number and old client did not happen',
          }),
        },
        `Balance transfer failed for client ${client.clientId}: client phone number and old client did not happen`,
      );
      throw new PhoneNumbersDoNotMatch(client.phone, oldClient.phone);
    }

    if (!oldClient || oldClient.userOnvi === 1) {
      this.logger.warn(
        {
          action: 'balance_transfer_failed',
          timestamp: new Date(),
          clientId: client.clientId,
          details: JSON.stringify({
            devNomer: input.devNomer,
            reason: 'Client not found or already ONVI user',
          }),
        },
        `Balance transfer failed for client ${client.clientId}: client not found or already ONVI user`,
      );
      throw new CardNotMatchExceptions(input.devNomer);
    }

    if (!card || card.isDel === 1 || card.isLocked === 1) {
      this.logger.warn(
        {
          action: 'balance_transfer_failed',
          timestamp: new Date(),
          clientId: client.clientId,
          details: JSON.stringify({
            devNomer: input.devNomer,
            reason: 'Card not found, deleted or locked',
          }),
        },
        `Balance transfer failed for client ${client.clientId}: card not found, deleted or locked`,
      );
      throw new CardNotMatchExceptions(input.devNomer);
    }

    const newCard = client.getCard();
    const realBalance = input.realBalance.toString();
    const extId = this.generateUniqueExt();
    const adminId = 3;
    oldClient.isActivated = 0;

    try {
      await this.cardRepository.delete(card.cardId);
      this.logger.log(
        {
          action: 'card_deleted',
          timestamp: new Date(),
          clientId: client.clientId,
          details: JSON.stringify({
            cardId: card.cardId,
          }),
        },
        `Card ${card.cardId} deleted for balance transfer`,
      );

      await this.clientRepository.update(oldClient);
      this.logger.log(
        {
          action: 'old_client_deactivated',
          timestamp: new Date(),
          clientId: oldClient.clientId,
          details: JSON.stringify({
            oldClientId: oldClient.clientId,
          }),
        },
        `Old client ${oldClient.clientId} deactivated for balance transfer`,
      );

      await this.transactionRepository.create(
        client,
        newCard,
        realBalance,
        extId,
      );
      this.logger.log(
        {
          action: 'new_transaction_created',
          timestamp: new Date(),
          clientId: client.clientId,
          details: JSON.stringify({
            clientId: client.clientId,
            cardId: newCard.cardId,
            amount: realBalance,
            extId: extId,
          }),
        },
        `New transaction created for balance transfer: ${extId}`,
      );

      await this.transactionRepository.add(
        card.cardId.toString(),
        '5',
        card.balance.toString(),
        `ONVI BALANCE TRANSFER ${extId}`,
        adminId.toString(),
      );
      this.logger.log(
        {
          action: 'old_card_transaction_added',
          timestamp: new Date(),
          clientId: client.clientId,
          details: JSON.stringify({
            cardId: card.cardId,
            amount: card.balance,
            extId: extId,
          }),
        },
        `Old card transaction added for balance transfer: ${extId}`,
      );


      const airBalance = input.airBalance;

      this.logger.log(
        {
          message: `airBalance: ${airBalance}`
        }
      );

      if (airBalance === 0 || airBalance < 50) {
        return ;
      }

      const maxPromoCodeValue = 300;
      const numberOfFullPromoCodes = Math.floor(airBalance / maxPromoCodeValue);
      const remainder = airBalance % maxPromoCodeValue;
      const promoCodes = [];
    
      const expirationDate = new Date();
      expirationDate.setMonth(expirationDate.getMonth() + 6);
    
      // Создание полных промокодов по 300 рублей
      for (let i = 0; i < numberOfFullPromoCodes; i++) {
        const promoCodeData = new PromoCode(
          `ONVITRANSFER${card.cardId}_${i}`,
          1,
          expirationDate,
          1,
          new Date(),
          3,
          1,
          {
            discount: maxPromoCodeValue,
            updatedAt: new Date(),
          },
        );
    
        const promoCode = await this.promoCodeUsecase.create(promoCodeData);
        await this.promoCodeUsecase.bindClient(promoCode, client);
    
        this.logger.log(
          {
            action: 'promo_code_created',
            timestamp: new Date(),
            clientId: client.clientId,
            details: JSON.stringify({
              promoCode: promoCode.code,
              discount: maxPromoCodeValue,
              expirationDate: expirationDate,
            }),
          },
          `Promo code ${promoCode.code} created for client ${client.clientId}`,
        );

        promoCodes.push(promoCode);
      }
    
      // Создание дополнительного промокода на остаток, если он есть
      if (remainder > 0) {
        const promoCodeData = new PromoCode(
          `ONVITRANSFER${card.cardId}_R`,
          1,
          expirationDate,
          1,
          new Date(),
          3,
          1,
          {
            discount: remainder,
            updatedAt: new Date(),
          },
        );
    
        const promoCode = await this.promoCodeUsecase.create(promoCodeData);
        await this.promoCodeUsecase.bindClient(promoCode, client);
    
        this.logger.log(
          {
            action: 'promo_code_created',
            timestamp: new Date(),
            clientId:  client.clientId,
            details: JSON.stringify({
              promoCode: promoCode.code,
              discount: remainder,
              expirationDate: expirationDate,
            }),
          },
          `Promo code ${promoCode.code} created for client ${client.clientId}`,
        );

        promoCodes.push(promoCode);
      }

      this.logger.log(
        {
          action: 'balance_transfer_completed',
          timestamp: new Date(),
          clientId: client.clientId,
          details: JSON.stringify({
            realBalance: input.realBalance,
            airBalance: input.airBalance,
            promoCode: promoCodes[0].code,
          }),
        },
        `Balance transfer completed successfully for client ${client.clientId}`,
      );

      return promoCodes[0];
    } catch (error) {
      this.logger.error(
        {
          action: 'balance_transfer_error',
          timestamp: new Date(),
          clientId: client.clientId,
          details: JSON.stringify({
            error: error.message,
            stack: error.stack,
          }),
        },
        `Balance transfer failed for client ${client.clientId}: ${error.message}`,
      );
      throw error;
    }
  }

  generateUniqueExt() {
    const prefix = 'Transaction';
    const uniqueId = Date.now(); // получаем текущую дату и время в миллисекундах как уникальный идентификатор
    return `${prefix}_${uniqueId}`;
  }
}
