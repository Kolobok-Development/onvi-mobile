import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PromotionUsecase } from '../../application/usecases/promotion/promotion.usecase';
import { JwtGuard } from '../../infrastructure/common/guards/jwt.guard';
import { ApplyPromotionDto } from '../../application/usecases/promotion/dto/apply-promotion.dto';
import { ClientException } from '../../infrastructure/common/exceptions/base.exceptions';
import { CustomHttpException } from '../../infrastructure/common/exceptions/custom-http.exception';
import { InvalidPromoCodeException } from '../../domain/promo-code/exceptions/invalid-promo-code.exception';
import { PromotionNotFoundException } from '../../domain/promotion/exceptions/promotion-not-found.exception';
import { InvalidPromotionException } from '../../domain/promotion/exceptions/invalid-promotion.exception';
import { PromotionResponseDto } from './dto/response/promotion-response.dto';
import { PromotionStatus } from '../../domain/promotion/enums/promotion-status.enum';

@Controller('promotion')
export class PromotionController {
  constructor(private readonly promotionUsecase: PromotionUsecase) {}

  @UseGuards(JwtGuard)
  @Post('apply')
  @HttpCode(201)
  async apply(@Body() data: ApplyPromotionDto, @Req() req: any): Promise<any> {
    try {
      const { user } = req;
      const promotion = await this.promotionUsecase.apply(data, user);
      return new PromotionResponseDto({
        status: PromotionStatus.ACTIVATION_SUCCESS,
        code: promotion.code,
      });
    } catch (e) {
      if (e instanceof PromotionNotFoundException) {
        throw new CustomHttpException({
          type: e.type,
          innerCode: e.innerCode,
          message: e.message,
          code: HttpStatus.NOT_FOUND,
        });
      } else if (e instanceof InvalidPromotionException) {
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

  @Get()
  @UseGuards(JwtGuard)
  @HttpCode(200)
  async getActivePromotion(): Promise<any> {
    try {
      return await this.promotionUsecase.getActivePromotions();
    } catch (e) {
      if (e instanceof PromotionNotFoundException) {
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
