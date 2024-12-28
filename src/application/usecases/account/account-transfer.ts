import {Injectable} from "@nestjs/common";
import {Client} from "../../../domain/account/client/model/client";
import {FindMethodsCardUseCase} from "./account-card-find-methods";
import {ICardRepository} from "../../../domain/account/card/card-repository.abstract";
import {CardNotMatchExceptions} from "../../../domain/account/exceptions/card-not-match.exceptions";
import {AccountTransferDataResponseDto} from "../../../api/dto/res/account-transfer-data.dto";
import {AccountTransferDto} from "../../../api/dto/req/account-transfer.dto";
import {ITransactionRepository} from "../../../domain/transaction/transaction-repository.abstract";
import {DeleteAccountUseCase} from "./account-delete";
import {PromoCode} from "../../../domain/promo-code/model/promo-code.model";
import {PromocodeUsecase} from "../promocode/promocode.usecase";

@Injectable()
export class AccountTransferUseCase {
    constructor(
        private readonly findMethodsCardUseCase: FindMethodsCardUseCase,
        private readonly cardRepository: ICardRepository,
        private readonly transactionRepository: ITransactionRepository,
        private readonly promoCodeUsecase: PromocodeUsecase,
    ) {
    }

    async transferData(devNomer: string, client: Client): Promise<AccountTransferDataResponseDto> {
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
            airBalance: Math.ceil(card.airBalance / 10) * 10,
        }
    }

    async transfer(input: AccountTransferDto, client: Client): Promise<any> {
        const card = await this.findMethodsCardUseCase.getOneByDevNomer(input.devNomer);
        if (!card || card.isDel === 1 || card.isLocked === 1) {
            throw new CardNotMatchExceptions(input.devNomer);
        }

        const newCard = client.getCard();
        const realBalance = input.realBalance.toString();
        const extId = this.generateUniqueExt();

        const deletedAccount = await this.cardRepository.delete(card.cardId);
        const transactionNew = await this.transactionRepository.create(client, newCard, realBalance, extId);

        const expirationDate = new Date();
        const newMonth = expirationDate.getMonth() + 3;
        expirationDate.setMonth(newMonth)

        const promoCodeDate = new PromoCode(
            `ONVI${card.cardId}`,
            1,
            expirationDate,
            1,
            new Date(),
            3,
            1,
            {
                discount: input.airBalance,
                updatedAt: new Date(),
            }
        )
        const promoCode = await this.promoCodeUsecase.create(promoCodeDate);
        await this.promoCodeUsecase.bindClient(promoCode, client);
        return promoCode;
    }

    generateUniqueExt() {
        const prefix = 'Transaction';
        const uniqueId = Date.now(); // получаем текущую дату и время в миллисекундах как уникальный идентификатор
        return `${prefix}_${uniqueId}`;
    }
}