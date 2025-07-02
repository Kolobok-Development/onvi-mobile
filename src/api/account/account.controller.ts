import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
//import { ThrottlerGuard } from '@nestjs/throttler';
//import { ThrottleType } from '../../infrastructure/common/decorators/throttler.decorator';
import { JwtGuard } from '../../infrastructure/common/guards/jwt.guard';
import { CustomHttpException } from '../../infrastructure/common/exceptions/custom-http.exception';
import { HistOptionsDto } from '../dto/req/hist-options.dto';
import { AccountNotFoundExceptions } from '../../domain/account/exceptions/account-not-found.exceptions';
import { AccountClientUpdateDto } from '../dto/req/account-client-update.dto';
import { AccountCreateMetaDto } from '../dto/req/account-create-meta.dto';
import { MetaExistsExceptions } from '../../domain/account/exceptions/meta-exists.exception';
import { AccountUpdateMetaDto } from '../dto/req/account-update-meta.dto';
import { MetaNotFoundExceptions } from '../../domain/account/exceptions/meta-not-found.exception';
import { CreateMetaUseCase } from '../../application/usecases/account/account-meta-create';
import { UpdateMetaUseCase } from '../../application/usecases/account/account-meta-update';
import { FindMethodsMetaUseCase } from '../../application/usecases/account/account-meta-find-methods';
import { UpdateClientUseCase } from '../../application/usecases/account/account-client-update';
import { CardService } from '../../application/services/card-service';
import { DeleteAccountUseCase } from '../../application/usecases/account/account-delete';
import { PromocodeUsecase } from '../../application/usecases/promocode/promocode.usecase';
import { AccountTransferDataDto } from '../dto/req/account-transfer-data.dto';
import { AccountTransferUseCase } from '../../application/usecases/account/account-transfer';
import { CardNotMatchExceptions } from '../../domain/account/exceptions/card-not-match.exceptions';
import { AccountTransferDataResponseDto } from '../dto/res/account-transfer-data.dto';
import { AccountTransferDto } from '../dto/req/account-transfer.dto';
import { BalanceUpdateWebhookDto } from '../webhooks/dto/balance-update-webhook.dto';
import { BalanceGateway } from '../../websockets/balance/balance.gateway';
import { EnvConfigService } from '../../infrastructure/config/env-config/env-config.service';
import { Logger } from 'nestjs-pino';

@Controller('account')
//@UseGuards(ThrottlerGuard)
export class AccountController {
  constructor(
    private readonly updateClientUseCase: UpdateClientUseCase,
    private readonly createMetaUseCase: CreateMetaUseCase,
    private readonly updateMetaUseCase: UpdateMetaUseCase,
    private readonly deleteAccountUseCase: DeleteAccountUseCase,
    private readonly findMethodsMetaUseCase: FindMethodsMetaUseCase,
    private readonly promocodeUsecase: PromocodeUsecase,
    private readonly accountTransferUseCase: AccountTransferUseCase,
    private readonly cardService: CardService,
  ) {}

  @UseGuards(JwtGuard)
  @Get('/me')
  @HttpCode(200)
  async getCurrentAccount(@Request() req: any): Promise<any> {
    try {
      const { user } = req;
      const meta = await this.findMethodsMetaUseCase.getByClientId(
        user.clientId,
      );
      return user.getAccountInfo(meta);
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
      return await this.cardService.getCardTransactionsHistory(
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
  @Get('/free-vacuum')
  @HttpCode(200)
  async getFreeVacuum(
    @Request() request: any,
  ): Promise<{ limit: number; remains: number }> {
    try {
      const { user } = request;
      return await this.cardService.getFreeVacuum(user);
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
      return await this.cardService.getCardTariff(user);
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
  @Get('/activePromotion')
  @HttpCode(200)
  async getActivePromotion(
    @Req() request: any,
    @Query('latitude') latitude?: number,
    @Query('longitude') longitude?: number,
  ): Promise<any> {
    try {
      const { user } = request;
      const location =
        latitude !== undefined && longitude !== undefined
          ? { latitude, longitude }
          : undefined;
      return await this.promocodeUsecase.getActivePromotionHistoryForClient(
        user,
        location,
      );
    } catch (e) {
      throw new CustomHttpException({
        message: e.message,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @Patch()
  @UseGuards(JwtGuard)
  async updateAccountInfo(
    @Body() body: AccountClientUpdateDto,
    @Req() req: any,
  ) {
    const { user } = req;

    try {
      return await this.updateClientUseCase.execute(body, user);
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
  @UseGuards(JwtGuard)
  @HttpCode(201)
  async createMeta(@Body() body: AccountCreateMetaDto): Promise<any> {
    try {
      return await this.createMetaUseCase.execute(body);
    } catch (e) {
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
  @UseGuards(JwtGuard)
  @HttpCode(201)
  async updateMeta(@Body() body: AccountUpdateMetaDto): Promise<any> {
    try {
      await this.updateMetaUseCase.execute(body);
      return { status: 'SUCCESS' };
    } catch (e) {
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

  @Get('/transfer')
  @UseGuards(JwtGuard)
  @HttpCode(201)
  async transferData(
    @Query() query: AccountTransferDataDto,
    @Req() req: any,
  ): Promise<AccountTransferDataResponseDto> {
    const { user } = req;
    try {
      return await this.accountTransferUseCase.transferData(
        query.devNomer,
        user,
      );
    } catch (e) {
      if (e instanceof CardNotMatchExceptions) {
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

  @Post('/transfer')
  @UseGuards(JwtGuard)
  @HttpCode(201)
  //@ThrottleType('sensitive')
  async transfer(@Body() body: AccountTransferDto, @Req() req: any) {
    const { user } = req;
    try {
      return await this.accountTransferUseCase.transfer(body, user);
    } catch (e) {
      if (e instanceof CardNotMatchExceptions) {
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

  @Patch('notifications')
  @UseGuards(JwtGuard)
  @HttpCode(201)
  async updateNotifications(
    @Body() body: { notification: boolean },
    @Request() request: any,
  ): Promise<any> {
    try {
      const { user } = request;
      return await this.updateClientUseCase.execute(
        {
          notification: body.notification,
        },
        user,
      );
    } catch (e) {
      throw new CustomHttpException({
        message: e.message,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @Delete()
  @UseGuards(JwtGuard)
  async deleteAccount(@Request() request: any): Promise<any> {
    const { user } = request;
    try {
      await this.deleteAccountUseCase.execute(user);
      return { status: 'SUCCESS' };
    } catch (e) {
      throw new CustomHttpException({
        message: e.message,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
