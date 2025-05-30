import {
  Body,
  Controller,
  HttpCode,
  Post,
  UseGuards,
  Request,
  HttpStatus,
  Req,
  Get,
  Query,
} from '@nestjs/common';
import { OrderUsecase } from '../../application/usecases/order/order.usecase';
import { JwtGuard } from '../../infrastructure/common/guards/jwt.guard';
import { CreateOrderDto } from '../../application/usecases/order/dto/create-order.dto';
import { ClientException } from '../../infrastructure/common/exceptions/base.exceptions';
import { CustomHttpException } from '../../infrastructure/common/exceptions/custom-http.exception';
import { VerifyPromoDto } from '../../application/usecases/order/dto/verify-promo.dto';
import { PromoCodeNotFoundException } from '../../domain/promo-code/exceptions/promo-code-not-found.exception';
import { InvalidPromoCodeException } from '../../domain/promo-code/exceptions/invalid-promo-code.exception';
import { CreateOrderUseCase } from '../../application/usecases/order/create-order.use-case';
import { IPosService } from '../../infrastructure/pos/interface/pos.interface';
import { PingRequestDto } from '../../infrastructure/pos/dto/ping-request.dto';

@Controller('order')
export class OrderController {
  constructor(
    private readonly orderUsecase: OrderUsecase,
    private readonly createOrderUsecase: CreateOrderUseCase,
    private readonly posService: IPosService,
  ) {}

  @UseGuards(JwtGuard)
  @Post('create')
  @HttpCode(201)
  async create(@Body() data: CreateOrderDto, @Req() req: any): Promise<any> {
    try {
      const { user } = req;
      return await this.createOrderUsecase.execute(data, user);
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

  @UseGuards(JwtGuard)
  @Post('promo/validate')
  @HttpCode(200)
  async validatePromoCode(@Body() data: VerifyPromoDto, @Req() req: any) {
    try {
      const { user } = req;
      return await this.orderUsecase.validatePromo(data, user);
    } catch (e) {
      console.log(e);
      if (e instanceof PromoCodeNotFoundException) {
        throw new CustomHttpException({
          type: e.type,
          innerCode: e.innerCode,
          message: e.message,
          code: HttpStatus.NOT_FOUND,
        });
      } else if (e instanceof InvalidPromoCodeException) {
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

  @Get('ping')
  @UseGuards(JwtGuard)
  async pingCarWash(@Query() query: any) {
    return await this.posService.ping({
      posId: Number(query.carWashId),
      bayNumber: Number(query.bayNumber),
      type: query?.bayType,
    });
  }
}
