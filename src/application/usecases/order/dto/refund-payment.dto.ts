import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RefundPaymentDto {
  @IsNumber()
  @IsNotEmpty()
  orderId: number;

  @IsString()
  @IsNotEmpty()
  reason: string;
}