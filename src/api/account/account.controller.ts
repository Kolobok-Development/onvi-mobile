import { Controller, Get, HttpCode, Request, UseGuards } from '@nestjs/common';
import { AccountUsecase } from '../../application/usecases/account/account.usecase';
import { JwtGuard } from '../../infrastructure/common/guards/jwt.guard';

@Controller('account')
export class AccountController {
  constructor(private readonly acountUsecase: AccountUsecase) {}

  @UseGuards(JwtGuard)
  @Get('/me')
  @HttpCode(200)
  async getCurrentAccount(@Request() req: any): Promise<any> {
    const { user } = req;

    return user.getAccountInfo();
  }

  @Get('/orders')
  @HttpCode(200)
  async getOrdersHistoru(@Request() request: any): Promise<any> {
    return 'orders';
  }

  @Get('/notifications')
  @HttpCode(200)
  async getAccountNotifications(@Request() request: any): Promise<any> {
    return 'notifications';
  }
}
