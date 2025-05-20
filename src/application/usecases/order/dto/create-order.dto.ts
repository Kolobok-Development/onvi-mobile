import { Optional } from '@nestjs/common';
import { IsDefined, IsNumber, IsString } from 'class-validator';
import { IsNull } from 'typeorm';

export class CreateOrderDto {
  @IsNumber()
  @IsDefined()
  sum: number;
  @IsNumber()
  @IsDefined()
  rewardPointsUsed: number;
  @Optional()
  promoCodeId?: number;
  @IsNumber()
  @IsDefined()
  carWashId: number;
  @IsNumber()
  @IsDefined()
  bayNumber: number;
}
