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
import { UpdateOrderStatusUseCase } from '../../application/usecases/order/update-order-status.use-case';
import { UpdateOrderStatusDto } from '../../application/usecases/order/dto/update-order-status.dto';
import { OrderNotFoundException } from '../../domain/order/exceptions/order-base.exceptions';
import { Logger } from 'nestjs-pino';
import { Inject } from '@nestjs/common';
import { CarwashUseCase } from 'src/application/usecases/order/carwash.use-case';
import { LatestOptionsDto } from '../dto/req/latest-options.dto';
import { RefundPaymentDto } from 'src/application/usecases/order/dto/refund-payment.dto';
import { RefundPaymentUseCase } from 'src/application/usecases/order/refund-payment.use-case';

@Controller('order')
export class OrderController {
  constructor(
    private readonly validateOrderPromocodeUsecase: ValidateOrderPromocodeUsecase,
    private readonly createOrderUsecase: CreateOrderUseCase,
    private readonly posService: IPosService,
    private readonly registerPaymentUseCase: RegisterPaymentUseCase,
    private readonly getOrderByIdUseCase: GetOrderByIdUseCase,
    private readonly getOrderByTransactionIdUseCase: GetOrderByTransactionIdUseCase,
    private readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase,
    private readonly carwashUseCase: CarwashUseCase,
    private readonly refundPaymentUseCase: RefundPaymentUseCase,
    @Inject(Logger) private readonly logger: Logger,
  ) {}

  @UseGuards(JwtGuard)
  @Post('create')
  @HttpCode(201)
  async create(@Body() data: CreateOrderDto, @Req() req: any): Promise<any> {

    this.logger.log(
      {
        message: 'order create controller',
        data: data,
        request11: req
      }
    );
    
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

  @Get('/latest')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async getLatestCarwash(
    @Req() request: any, 
    @Query() options: LatestOptionsDto,
  ): Promise<number[]> {
    try {      
      const { user } = request;
      const { size, page } = options;
      
      return await this.carwashUseCase.getLatestCarwashByUser(user, size, page);
    } catch (e) {
      throw new CustomHttpException({
        message: e.message,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async getOrderById(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    try {
      const { user } = req;
      return await this.getOrderByIdUseCase.execute(id, user);
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

  @Post('status/:id')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateOrderStatusDto,
    @Req() req: any
  ) {
    try {
      await this.updateOrderStatusUseCase.execute(id, data.status);
      return { message: 'Order status updated successfully' };
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

  @UseGuards(JwtGuard)
  @Post('refund')
  @HttpCode(200)
  async refundPayment(
    @Body() data: RefundPaymentDto,
    @Req() req: any,
  ): Promise<any> {
    try {
      return await this.refundPaymentUseCase.execute(data);
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
