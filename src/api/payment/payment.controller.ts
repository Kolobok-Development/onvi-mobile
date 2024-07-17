import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { PaymentUsecase } from '../../application/usecases/payment/payment.usecase';
import { JwtGuard } from '../../infrastructure/common/guards/jwt.guard';
import { CreatePaymentDto } from '../../application/usecases/payment/dto/create-payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentUsecase: PaymentUsecase) {}

  @Post('')
  @UseGuards(JwtGuard)
  async create(@Body() body: CreatePaymentDto, @Req() req: any) {
    const { user } = req;
    return await this.paymentUsecase.create(body, user);
  }

  @Get('credentials')
  @UseGuards(JwtGuard)
  async getCredentials(@Req() req: any) {
    return await this.paymentUsecase.getGatewayCredentials();
  }
}
