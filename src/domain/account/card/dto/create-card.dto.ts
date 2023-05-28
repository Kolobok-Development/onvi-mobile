import { Client } from '../../client/model/client';
import { CardType } from '../enum/card-type.enum';

export interface ICreateCardDto {
  clientId: number;
  nomer: string;
  devNomer: string;
  cardTypeId: CardType;
  beginDate: Date;
}
