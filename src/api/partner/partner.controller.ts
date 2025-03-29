import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../../infrastructure/common/guards/jwt.guard';
import { CustomHttpException } from '../../infrastructure/common/exceptions/custom-http.exception';
import { GazpromUsecase } from '../../application/usecases/partner/gazprom/gazprom.usecase';
import { PartnerUsecase } from '../../application/usecases/partner/partner.usecase';
import { PartnerCreateDto } from './dto/partner-create.dto';
import { PartnerGuard } from '../../infrastructure/common/guards/partner.guard';
import { GazpromClientUpdateDto } from './dto/gazprom-client-update.dto';
import { NotFoundException } from '../../infrastructure/common/exceptions/base.exceptions';
import {GazpromClientReferenceDto} from "./dto/gazprom-client-reference.dto";
import {GazpromClientOperationDto} from "./dto/gazprom-client-operation";

@Controller('partner')
export class PartnerController {
  constructor(
    private readonly gazpromUsecase: GazpromUsecase,
    private readonly partnerUsecase: PartnerUsecase,
  ) {}

  @UseGuards(JwtGuard)
  @Post()
  @HttpCode(201)
  async createPartner(@Body() data: PartnerCreateDto): Promise<any> {
    try {
      return await this.partnerUsecase.createPartner(data);
    } catch (e) {
      throw new CustomHttpException({
        message: e.message,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @UseGuards(JwtGuard)
  @Post('2921/reference')
  @HttpCode(201)
  async referenceGazprom(@Req() req: any, @Body() data: GazpromClientReferenceDto): Promise<any> {
    try {
      const { user } = req;
      return await this.gazpromUsecase.reference(user, data.reference);
    } catch (e) {
      throw new CustomHttpException({
        message: e.message,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @UseGuards(JwtGuard)
  @Post('2921/activate')
  @HttpCode(201)
  async activateSessionGazprom(@Req() req: any): Promise<any> {
    try {
      const { user } = req;
      return await this.gazpromUsecase.activationSession(user);
    } catch (e) {
      throw new CustomHttpException({
        message: e.message,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @UseGuards(JwtGuard)
  @Get('2921/subscription')
  @HttpCode(201)
  async getSubscriptionDataGazprom(@Req() req: any): Promise<any> {
    try {
      const { user } = req;
      return await this.gazpromUsecase.getSubscriptionData(user);
    } catch (e) {
      throw new CustomHttpException({
        message: e.message,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @UseGuards(JwtGuard)
  @Patch('2921')
  @HttpCode(201)
  async updatePartnerDataGazprom(
    @Req() req: any,
    @Body() data: GazpromClientOperationDto,
  ): Promise<any> {
    try {
      const { user } = req;
      return await this.gazpromUsecase.updatePartnerData(user, {meta: data});
    } catch (e) {
      throw new CustomHttpException({
        message: e.message,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @UseGuards(PartnerGuard)
  @Post('2921/clients/subscription/create')
  @HttpCode(201)
  async createClientDataGazprom(
    @Body() data: GazpromClientUpdateDto,
    @Req() req: any,
  ): Promise<any> {
    try {
      const { user } = req;
      return await this.gazpromUsecase.updateClientData(data, user);
    } catch (e) {
      if (e instanceof NotFoundException) {
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

  @UseGuards(PartnerGuard)
  @Post('2921/clients/subscription/cancel')
  @HttpCode(201)
  async cancelGazprom(
    @Body() data: GazpromClientUpdateDto,
    @Req() req: any,
  ): Promise<any> {
    try {
      const { user } = req;
      return await this.gazpromUsecase.cancelClientData(data, user);
    } catch (e) {
      if (e instanceof NotFoundException) {
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

  @UseGuards(PartnerGuard)
  @Post('2921/clients/subscription/refresh')
  @HttpCode(201)
  async refreshClientDataGazprom(
    @Body() data: GazpromClientUpdateDto,
    @Req() req: any,
  ): Promise<any> {
    try {
      const { user } = req;
      return await this.gazpromUsecase.updateClientData(data, user);
    } catch (e) {
      if (e instanceof NotFoundException) {
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
