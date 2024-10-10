import { Card } from '../../card/model/card';
import { ShortCardDto } from '../../card/dto/short-card.dto';
import {OnviMeta} from "../model/onviMeta";

export interface ShortClientDto {
  id: number;
  name: string;
  email: string;
  phone: string;
  birthday: Date;
  refreshToken: string;
  avatar: string;
  isNotifications: number;
  cards: ShortCardDto;
  meta?: OnviMeta;
}
