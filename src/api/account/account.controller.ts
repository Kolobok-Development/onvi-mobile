import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AccountUsecase } from '../../application/usecases/account/account.usecase';
import { JwtGuard } from '../../infrastructure/common/guards/jwt.guard';
import { CustomHttpException } from '../../infrastructure/common/exceptions/custom-http.exception';
import { HistOptionsDto } from './dto/hist-options.dto';
import { AccountNotFoundExceptions } from '../../domain/account/exceptions/account-not-found.exceptions';
import { UpdateAccountDto } from '../../application/usecases/account/dto/update-account.dto';

@Controller('account')
export class AccountController {
  constructor(private readonly acountUsecase: AccountUsecase) {}

  @UseGuards(JwtGuard)
  @Get('/me')
  @HttpCode(200)
  async getCurrentAccount(@Request() req: any): Promise<any> {
    try {
      const { user } = req;

      return user.getAccountInfo();
    } catch (e) {
      throw new CustomHttpException({
        message: e.message,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
  @UseGuards(JwtGuard)
  @Get('/orders')
  @HttpCode(200)
  async getOrdersHistoru(
    @Request() request: any,
    @Query() options: HistOptionsDto,
  ): Promise<any> {
    try {
      const { size, page } = options;
      const { user } = request;
      return await this.acountUsecase.getCardTransactionsHistory(
        user,
        size,
        page,
      );
    } catch (e) {
      throw new CustomHttpException({
        message: e.message,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @UseGuards(JwtGuard)
  @Get('/tariff')
  @HttpCode(200)
  async getAccountNotifications(@Req() request: any): Promise<any> {
    try {
      const { user } = request;
      return await this.acountUsecase.getCardTariff(user);
    } catch (e) {
      if (e instanceof AccountNotFoundExceptions) {
        throw new CustomHttpException({
          type: e.type,
          innerCode: e.innerCode,
          message: e.message,
          code: HttpStatus.NOT_FOUND,
        });
      } else {
        throw new CustomHttpException({
          message: e.message,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
        });
      }
    }
  }

  @Patch()
  @UseGuards(JwtGuard)
  async updateAccountInfo(@Body() body: UpdateAccountDto, @Req() req: any) {
    const { user } = req;

    try {
      const client = await this.acountUsecase.updateAccountInfo(body, user);

      return {
        client: client.getAccountInfo(),
      };
    } catch (e: any) {
      console.log(e);
      if (e instanceof AccountNotFoundExceptions) {
        throw new CustomHttpException({
          type: e.type,
          innerCode: e.innerCode,
          message: e.message,
          code: HttpStatus.NOT_FOUND,
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
