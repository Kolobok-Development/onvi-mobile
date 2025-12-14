import { Injectable } from '@nestjs/common';
import { AccountFavoritesDto } from 'src/api/dto/req/accout-favorites.dto';
import { IFavoritesRepository } from 'src/domain/account/favorites/favorites-repository.abstract';

@Injectable()
export class FavoritesUseCase {
  constructor(private readonly favoritesRepository: IFavoritesRepository) {}

  async getFavoritesByClientId(clientId: number): Promise<number[]> {
    return await this.favoritesRepository.findAllCarwashIdsByClientId(clientId);
  }

  async addFavoritesByClientId(
    input: AccountFavoritesDto,
    clientId: number,
  ): Promise<number[]> {
    return await this.favoritesRepository.addCarwashIdByClientId(
      input.carwashId,
      clientId,
    );
  }

  async removeFavoriteByClientId(
    input: AccountFavoritesDto,
    clientId: number,
  ): Promise<number[]> {
    return await this.favoritesRepository.removeCarwashIdByClientId(
      input.carwashId,
      clientId,
    );
  }
}
