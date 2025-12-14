import { Card } from './model/card';
import { Tariff } from './model/tariff';

export abstract class ITariffRepository {
  abstract findCardTariff(card: Card): Promise<Tariff>;
}
