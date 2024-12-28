import { ClientType } from '../account/client/enum/clinet-type.enum';
import { Card } from '../account/card/model/card';

export interface ICreateClientDto {
  rawPhone: string;
  clientType: ClientType;
  refreshToken: string;
  cards?: Card[];
}
