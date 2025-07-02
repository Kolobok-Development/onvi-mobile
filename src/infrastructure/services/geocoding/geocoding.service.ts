import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface GeocodeResponse {
  regionCode?: string;
  country?: string;
  region?: string;
  place?: string;
}

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private readonly mapboxAccessToken = process.env.MAPBOX_ACCESS_TOKEN;

  constructor(private readonly httpService: HttpService) {}

  async reverseGeocode(
    longitude: number,
    latitude: number,
  ): Promise<GeocodeResponse> {
    if (!this.mapboxAccessToken) {
      this.logger.warn('MAPBOX_ACCESS_TOKEN not configured');
      return {};
    }

    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json`;
      const params = {
        access_token: this.mapboxAccessToken,
        types: 'region,country,place',
      };

      const response = await firstValueFrom(
        this.httpService.get(url, { params }),
      );

      if (response.data?.features?.length > 0) {
        const features = response.data.features;
        const result: GeocodeResponse = {};

        for (const feature of features) {
          if (
            feature.place_type?.includes('region') &&
            feature.properties?.short_code
          ) {
            result.regionCode = feature.properties.short_code;
            result.region = feature.text;
          }
          if (feature.place_type?.includes('country')) {
            result.country = feature.text;
          }
          if (feature.place_type?.includes('place')) {
            result.place = feature.text;
          }
        }

        this.logger.log(`Geocoded location: ${JSON.stringify(result)}`);
        return {};
      }

      return null;
    } catch (error) {
      this.logger.error('Failed to geocode location', error.message);
      return {};
    }
  }
}
