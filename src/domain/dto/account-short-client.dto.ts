import { Card } from '../account/card/model/card';
import { AccountShortCardDto } from './account-short-card.dto';
import {OnviMeta} from "../account/client/model/onviMeta";

export interface AccountShortClientDto {
  id: number;
  name: string;
  email: string;
  phone: string;
  birthday: Date;
  refreshToken: string;
  avatar: string;
  isNotifications: number;
  cards: AccountShortCardDto;
  meta?: OnviMeta;
}
