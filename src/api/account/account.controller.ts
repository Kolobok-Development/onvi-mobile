import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch, Post,
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
import {CreateMetaDto} from "../../application/usecases/account/dto/create-meta.dto";
import {MetaExistsExceptions} from "../../domain/account/exceptions/meta-exists.exception";
import {UpdateMetaDto} from "../../application/usecases/account/dto/update-meta.dto";
import {MetaNotFoundExceptions} from "../../domain/account/exceptions/meta-not-found.exception";

@Controller('account')
export class AccountController {
  constructor(private readonly accountUsecase: AccountUsecase) {}

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
      return await this.accountUsecase.getCardTransactionsHistory(
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
      return await this.accountUsecase.getCardTariff(user);
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

  @UseGuards(JwtGuard)
  @Get('/promotion')
  @HttpCode(200)
  async getPromotionHistory(@Req() request: any): Promise<any> {
    try {
      const { user } = request;
      return await this.accountUsecase.getPromotionHistory(user);
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
      return await this.accountUsecase.updateAccountInfo(body, user);
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

  @Post('/meta/create')
  @HttpCode(201)
  async createMeta(@Body() body: CreateMetaDto): Promise<any> {
    try {
      return await this.accountUsecase.createMeta(body);
    }  catch (e) {
      if (e instanceof MetaExistsExceptions) {
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

  @Post('/meta/update')
  @HttpCode(201)
  async updateMeta(@Body() body: UpdateMetaDto): Promise<any> {
    try {
      await this.accountUsecase.updateMeta(body);
      return {status: "SUCCESS"}
    }  catch (e) {
      if (e instanceof MetaNotFoundExceptions) {
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
