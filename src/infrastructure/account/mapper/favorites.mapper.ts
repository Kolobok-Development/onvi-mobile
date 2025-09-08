import { FavoritesEntity } from "../entity/favorites.entity";
import { Favorites } from "src/domain/account/favorites/model/favorites";

export class FavoritesMapper {
  static fromEntity(entity: FavoritesEntity): Favorites {
    const {
      id,
      carWashId,
      clientId,
      addedDate
    } = entity;

    return new Favorites(
      id,
      carWashId,
      clientId,
      addedDate
    );
  }
  
  static toFavoritesEntity(favorites: Favorites): FavoritesEntity {
    const favoritesEntity: FavoritesEntity = new FavoritesEntity();

    favoritesEntity.id = favorites.id;
    favoritesEntity.carWashId = favorites.carWashId;
    favoritesEntity.clientId = favorites.clientId;
    favoritesEntity.addedDate = favorites.addedDate;
  
    return favoritesEntity;
  }
}