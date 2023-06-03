import {
  Body,
  Controller,
  HttpCode,
  Post,
  UseGuards,
  Request,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { OrderUsecase } from '../../application/usecases/order/order.usecase';
import { JwtGuard } from '../../infrastructure/common/guards/jwt.guard';
import { CreateOrderDto } from '../../application/usecases/order/dto/create-order.dto';
import { ClientException } from '../../infrastructure/common/exceptions/base.exceptions';
import { CustomHttpException } from '../../infrastructure/common/exceptions/custom-http.exception';

@Controller('order')
export class OrderController {
  constructor(private readonly orderUsecase: OrderUsecase) {}

  @UseGuards(JwtGuard)
  @Post('create')
  @HttpCode(201)
  async create(@Body() data: CreateOrderDto, @Req() req: any): Promise<any> {
    try {
      const { user } = req;
      return await this.orderUsecase.create(data, user);
    } catch (e) {
      if (e instanceof ClientException) {
        throw new CustomHttpException({
          type: e.type,
          innerCode: e.innerCode,
          message: e.message,
          code: HttpStatus.UNPROCESSABLE_ENTITY,
        });
      } else {
        throw new CustomHttpException({
          message: e.message,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
        });
      }
    }
  }
}
