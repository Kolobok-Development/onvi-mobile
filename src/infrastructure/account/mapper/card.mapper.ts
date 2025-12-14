import { CardEntity } from '../entity/card.entity';
import { Card } from '../../../domain/account/card/model/card';

export class CardMapper {
  static fromEntity(entity: CardEntity): Card {
    const {
      cardId,
      balance,
      isLocked,
      dateBegin,
      dateEnd,
      client,
      cardTypeId,
      devNomer,
      isDel,
      cmnCity,
      realBalance,
      airBalance,
      nomer,
      vacuumFreeLimit,
      tag,
    } = entity;

    return new Card(
      cardTypeId,
      nomer,
      devNomer,
      balance,
      airBalance,
      realBalance,
      vacuumFreeLimit,
      dateBegin,
      {
        cardId,
        isLocked,
        dateEnd,
        isDel,
        cmnCity,
        tag,
        clientId: client?.clientId,
      },
    );
  }

  static toCardEntity(card: Card): CardEntity {
    const cardEntity: CardEntity = new CardEntity();

    cardEntity.isLocked = card.isLocked;
    cardEntity.dateEnd = card.dateEnd;
    cardEntity.cardTypeId = card.cardTypeId;
    cardEntity.devNomer = card.devNomer;
    cardEntity.isDel = card.isDel;
    cardEntity.cmnCity = card.cmnCity;
    cardEntity.nomer = card.nomer;
    cardEntity.tag = card.tag;
    cardEntity.balance = card.balance;
    cardEntity.realBalance = card.realBalance;
    cardEntity.airBalance = card.airBalance;
    cardEntity.vacuumFreeLimit = card.vacuumFreeLimit;

    return cardEntity;
  }
}
