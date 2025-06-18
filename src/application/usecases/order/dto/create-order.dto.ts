import { Optional } from '@nestjs/common';
import {IsBoolean, IsDefined, IsEnum, IsNumber, IsOptional, IsString} from 'class-validator';
import { IsNull } from 'typeorm';
import {DeviceType} from "../../../../domain/order/enum/device-type.enum";

export class CreateOrderDto {
  @IsNumber()
  @IsDefined()
  sum: number;
  @IsNumber()
  @IsDefined()
  rewardPointsUsed: number;
  @Optional()
  @IsNumber()
  originalSum?: number;
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
  @Optional()
  err?: number;
}
