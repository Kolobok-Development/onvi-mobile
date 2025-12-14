import { IsNotEmpty, IsNumber } from 'class-validator';

export class AccountFavoritesDto {
  @IsNumber()
  @IsNotEmpty({ message: 'carwashId is required' })
  carwashId: number;
}
