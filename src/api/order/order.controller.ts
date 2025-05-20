import {
  Body,
  Controller,
  HttpCode,
  Post,
  UseGuards,
  HttpStatus,
  Req,
  Get,
  Query,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ValidateOrderPromocodeUsecase } from '../../application/usecases/order/validate-order-promocode.usecase';
import { JwtGuard } from '../../infrastructure/common/guards/jwt.guard';
import { CreateOrderDto } from '../../application/usecases/order/dto/create-order.dto';
import { ClientException } from '../../infrastructure/common/exceptions/base.exceptions';
import { CustomHttpException } from '../../infrastructure/common/exceptions/custom-http.exception';
import { VerifyPromoDto } from '../../application/usecases/order/dto/verify-promo.dto';
import { PromoCodeNotFoundException } from '../../domain/promo-code/exceptions/promo-code-not-found.exception';
import { InvalidPromoCodeException } from '../../domain/promo-code/exceptions/invalid-promo-code.exception';
import { CreateOrderUseCase } from '../../application/usecases/order/create-order.use-case';
import { IPosService } from '../../infrastructure/pos/interface/pos.interface';
import { RegisterPaymentUseCase } from '../../application/usecases/order/register-payment.use-case';
import { IRegisterPaymentDto } from '../../application/usecases/order/dto/register-payment.dto';
import { GetOrderByIdUseCase } from '../../application/usecases/order/get-order-by-id.use-case';
import { GetOrderByTransactionIdUseCase } from '../../application/usecases/order/get-order-by-transaction-id.use-case';
import { OrderNotFoundException } from '../../domain/order/exceptions/order-base.exceptions';

@Controller('order')
export class OrderController {
  constructor(
    private readonly validateOrderPromocodeUsecase: ValidateOrderPromocodeUsecase,
    private readonly createOrderUsecase: CreateOrderUseCase,
    private readonly posService: IPosService,
    private readonly registerPaymentUseCase: RegisterPaymentUseCase,
    private readonly getOrderByIdUseCase: GetOrderByIdUseCase,
    private readonly getOrderByTransactionIdUseCase: GetOrderByTransactionIdUseCase,
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
  @Post('register')
  @HttpCode(201)
  async registerPayment(
    @Body() data: IRegisterPaymentDto,
    @Req() req: any,
  ): Promise<any> {
    try {
      return await this.registerPaymentUseCase.execute(data);
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
      return await this.validateOrderPromocodeUsecase.validatePromo(data, user);
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
    console.log(query);
    return await this.posService.ping({
      posId: Number(query.carWashId),
      bayNumber: Number(query.bayNumber),
    });
  }

  @Get('transaction/:transactionId')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async getOrderByTransactionId(@Param('transactionId') transactionId: string, @Req() req: any) {
    try {
      return await this.getOrderByTransactionIdUseCase.execute(transactionId);
    } catch (e) {
      if (e instanceof OrderNotFoundException) {
        throw new CustomHttpException({
          type: e.type,
          innerCode: e.innerCode,
          message: e.message,
          code: HttpStatus.NOT_FOUND,
        });
      } else if (e instanceof ClientException) {
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

  @Get(':id')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async getOrderById(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    try {
      return await this.getOrderByIdUseCase.execute(id);
    } catch (e) {
      if (e instanceof OrderNotFoundException) {
        throw new CustomHttpException({
          type: e.type,
          innerCode: e.innerCode,
          message: e.message,
          code: HttpStatus.NOT_FOUND,
        });
      } else if (e instanceof ClientException) {
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
