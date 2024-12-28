import { Client } from '../account/client/model/client';
import { CardType } from '../account/card/enum/card-type.enum';

export interface ICreateCardDto {
  clientId: number;
  nomer: string;
  devNomer: string;
  cardTypeId: CardType;
  beginDate: Date;
  isDel: number;
}
