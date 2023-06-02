import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AccountUsecase } from '../../application/usecases/account/account.usecase';
import { JwtGuard } from '../../infrastructure/common/guards/jwt.guard';
import { CustomHttpException } from '../../infrastructure/common/exceptions/custom-http.exception';
import { HistOptionsDto } from './dto/hist-options.dto';

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

  @Get('/notifications')
  @HttpCode(200)
  async getAccountNotifications(@Request() request: any): Promise<any> {
    return 'notifications';
  }
}
