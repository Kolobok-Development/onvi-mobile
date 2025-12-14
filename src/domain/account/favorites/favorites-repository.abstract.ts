export abstract class IFavoritesRepository {
  abstract findAllCarwashIdsByClientId(clientId: number): Promise<number[]>;
  abstract addCarwashIdByClientId(
    carwashId: number,
    clientId: number,
  ): Promise<number[]>;
  abstract removeCarwashIdByClientId(
    carwashId: number,
    clientId: number,
  ): Promise<number[]>;
}
