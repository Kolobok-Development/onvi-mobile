import { Card } from '../../card/model/card';
import { ShortCardDto } from '../../card/dto/short-card.dto';

export interface ShortClientDto {
  name: string;
  email: string;
  phone: string;
  birthday: Date;
  refreshToken: string;
  cards: ShortCardDto;
}
