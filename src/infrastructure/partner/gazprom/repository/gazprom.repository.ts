import { Injectable } from '@nestjs/common';
import { IGazpromRepository } from '../../../../domain/partner/gazprom/gazprom-repository.abstract';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { GazpromErrorDto } from '../dto/gazprom-error.dto';
import { GazpromSessionDto } from '../dto/gazprom-session.dto';
import { GazpromSubscriptionResponseDto } from '../dto/gazprom-subscription-response.dto';
import { GazpromUpdateOperDto } from '../dto/gazprom-update-oper.dto';
import { GazpromUpdateResponseDto } from '../dto/gazprom-update-response.dto';
import { EnvConfigService } from '../../../config/env-config/env-config.service';

@Injectable()
export class GazpromRepository implements IGazpromRepository {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly partnerId: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly env: EnvConfigService,
  ) {
    this.baseUrl = this.env.getGazpromBaseUrl();
    this.apiKey = this.env.getGazpromAuthToken();
    this.partnerId = this.env.getGazpromPartnerId().toString();
  }

  async registration(
    partnerClientId: string,
    phoneNumber: string,
  ): Promise<GazpromSessionDto | GazpromErrorDto> {
    const config = this.setHeaders();
    const body = {
      partner_user_id: partnerClientId,
      phone_number: phoneNumber,
    };

    try {
      const request: AxiosResponse = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/v1/partners/${this.partnerId}/register/client`,
          body,
          config,
        ),
      );
      return { token: request.data.token };
    } catch (err) {
      const { response } = err;
      return new GazpromErrorDto(
        response.data.code,
        response.data.message,
        response.data.correlation_id,
        response.data.details,
      );
    }
  }

  async reference(
      reference:string,
      partnerClientId: string,
      phoneNumber: string,
  ): Promise<GazpromSessionDto | GazpromErrorDto> {
    const config = this.setHeaders();
    const body = {
      reference: reference,
      params: {
        partner_user_id: partnerClientId,
        phone_number: phoneNumber,
      }
    };

    try {
      const request: AxiosResponse = await firstValueFrom(
          this.httpService.post(
              `${this.baseUrl}/v1/partners/${this.partnerId}/reference/client`,
              body,
              config,
          ),
      );
      return { token: request.data.token };
    } catch (err) {
      const { response } = err;
      return new GazpromErrorDto(
          response.data.code,
          response.data.message,
          response.data.correlation_id,
          response.data.details,
      );
    }
  }

  async getSubscriptionData(
      partnerClientId: string,
  ): Promise<GazpromSubscriptionResponseDto | GazpromErrorDto> {
    const config = this.setHeaders();

    try {
      const request: AxiosResponse = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/v1/partners/${this.partnerId}/clients/${partnerClientId}/user-promotions?filter.public_ids=moyka_01`,
          config,
        ),
      );
      return new GazpromSubscriptionResponseDto(
        request.data.items,
        request.data.count,
      );
    } catch (err) {
      const { response } = err;
      return new GazpromErrorDto(
        response.data.code,
        response.data.message,
        response.data.correlation_id,
        response.data.details,
      );
    }
  }

  async getSession(
      partnerClientId: string,
  ): Promise<GazpromSessionDto | GazpromErrorDto> {
    const config = this.setHeaders();

    console.log('start request')
    try {
      const request: AxiosResponse = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/v1/partners/${this.partnerId}/clients/${partnerClientId}/create/session`,
          null,
          config,
        ),
      );
      console.log(request)
      return { token: request.data.token };
    } catch (err) {
      const { response } = err;
      return new GazpromErrorDto(
        response.data.code,
        response.data.message,
        response.data.correlation_id,
        response.data.details,
      );
    }
  }

  async updateData(
      partnerClientId: string,
    meta: GazpromUpdateOperDto,
  ): Promise<GazpromUpdateResponseDto | GazpromErrorDto> {
    const config = this.setHeaders();

    try {
      const request: AxiosResponse = await firstValueFrom(
        this.httpService.patch(
          `${this.baseUrl}/v1/partners/${this.partnerId}/clients/${partnerClientId}`,
          meta,
          config,
        ),
      );
      return request.data;
    } catch (err) {
      const { response } = err;
      return new GazpromErrorDto(
        response.data.code,
        response.data.message,
        response.data.correlation_id,
        response.data.details,
      );
    }
  }

  private setHeaders(): { headers: { Authorization: string } } {
    return {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    };
  }
}
