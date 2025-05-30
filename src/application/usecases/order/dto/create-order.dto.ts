import { Optional } from '@nestjs/common';
import { IsDefined, IsNumber, IsString } from 'class-validator';
import { IsNull } from 'typeorm';
import {DeviceType} from "../../../../domain/order/enum/device-type.enum";

export class CreateOrderDto {
  @Optional()
  @IsString()
  transactionId?: string;
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
  @Optional()
  bayType?: DeviceType;
}
