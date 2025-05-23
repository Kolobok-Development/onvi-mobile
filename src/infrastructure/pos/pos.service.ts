import { IPosService } from './interface/pos.interface';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { HeadersReq } from './dto/headers-req.dto';
import { PingRequestDto } from './dto/ping-request.dto';
import { PingResponseDto } from './dto/ping-response.dto';
import { SendRequestDto } from './dto/send-request.dto';
import { SendResponseDto } from './dto/send-response.dto';
import { firstValueFrom } from 'rxjs';
import { EnvConfigService } from '../config/env-config/env-config.service';
import { SendStatus } from '../order/enum/send-status.enum';

@Injectable()
export class PosService implements IPosService {
  private apiKey: string;
  private baseUrl: string;
  private sourceCode: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly envConfig: EnvConfigService,
  ) {
    this.apiKey = envConfig.getDsCloudApiKey();
    this.baseUrl = envConfig.getDsCloudBaseUrl();
    this.sourceCode = envConfig.getDsCloudSourceId();
  }

  async ping(data: PingRequestDto): Promise<PingResponseDto> {
    const headersReq = this.setHeaders();
    console.log(JSON.stringify(data));
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/external/collection/device?carwashId=${data.posId}&bayNumber=${data.bayNumber}` +
            (data.type ? `&type=${data.type}` : ''),
          { headers: { ...headersReq } },
        ),
      );

      return {
        id: response.data.identifier,
        status: response.data.status,
        type: response.data.type,
        errorMessage: null,
      };
    } catch (error: any) {
      const errorData = error.response?.data || error.message;
      return {
        id: null,
        status: 'Unavailable',
        type: null,
        errorMessage: errorData?.error || 'Unknown error',
      };
    }
  }

  async send(data: SendRequestDto): Promise<SendResponseDto> {
    const headersReq = this.setHeaders();
    try {
      const body = {
        GVLCardNum: data.cardNumber,
        GVLCardSum: data.sum,
        GVLSource: this.sourceCode,
      };

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/external/mobile/write/${data.deviceId}`,
          body,
          { headers: { ...headersReq } },
        ),
      );
      return {
        sendStatus: SendStatus.SUCCESS,
        errorMessage: null,
      };
    } catch (error: any) {
      const errorData = error.response?.data || error.message;
      return {
        sendStatus: SendStatus.FAIL,
        errorMessage: errorData?.error || 'Unknown error',
      };
    }
  }

  private setHeaders(): HeadersReq {
    return { akey: this.apiKey };
  }
}
