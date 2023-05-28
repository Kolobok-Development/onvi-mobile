import { ClientType } from '../enum/clinet-type.enum';
import { Card } from '../../card/model/card';

export interface ICreateClientDto {
  rawPhone: string;
  clientType: ClientType;
  refreshToken: string;
  cards?: Card[];
}
