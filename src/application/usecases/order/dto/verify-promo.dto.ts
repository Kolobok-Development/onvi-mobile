import { IsDefined, IsNumber, IsNumberString, IsString } from 'class-validator';

export class VerifyPromoDto {
  @IsString()
  @IsDefined()
  promoCode: string;
  @IsNumber()
  @IsDefined()
  carWashId: number;
}
