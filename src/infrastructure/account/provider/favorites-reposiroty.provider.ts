import { Provider } from "@nestjs/common";
import { FavoritesRepository } from "../repository/favorites.repository";
import { IFavoritesRepository } from "src/domain/account/favorites/favorites-repository.abstract";

export const FavoritesRepositoryProvider: Provider = {
  provide: IFavoritesRepository,
  useClass: FavoritesRepository
}