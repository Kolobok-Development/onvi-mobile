import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IFavoritesRepository } from 'src/domain/account/favorites/favorites-repository.abstract';
import { FavoritesEntity } from '../entity/favorites.entity';

@Injectable()
export class FavoritesRepository implements IFavoritesRepository {
  constructor(
    @InjectRepository(FavoritesEntity)
    private readonly favoritesRepository: Repository<FavoritesEntity>,
  ) { }

  async findAllCarwashIdsByClientId(clientId: number): Promise<number[]> {
    const favorites = await this.favoritesRepository
      .createQueryBuilder('favorite')
      .select('favorite.carWashId')
      .where('favorite.clientId = :clientId', { clientId })
      .getMany();

    return favorites.map(favorite => favorite.carWashId);
  }

  async addCarwashIdByClientId(carWashId: number, clientId: number): Promise<number[]> {
    const existingFavorite = await this.favoritesRepository.findOne({
      where: {
        clientId,
        carWashId,
      },
    });

    if (existingFavorite) {
      return this.findAllCarwashIdsByClientId(clientId);
    }

    const newFavorite = this.favoritesRepository.create({
      clientId,
      carWashId,
    });

    await this.favoritesRepository.save(newFavorite);
    
    return this.findAllCarwashIdsByClientId(clientId);
  }

  async removeCarwashIdByClientId(carWashId: number, clientId: number): Promise<number[]> {
    await this.favoritesRepository.delete({
      clientId,
      carWashId,
    });
    
    return this.findAllCarwashIdsByClientId(clientId);
  }
}
