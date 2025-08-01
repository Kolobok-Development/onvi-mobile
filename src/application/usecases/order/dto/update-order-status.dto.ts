import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '../../../../domain/order/enum/order-status.enum';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;
}