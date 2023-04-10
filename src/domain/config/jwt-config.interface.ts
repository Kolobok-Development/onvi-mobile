export abstract class IJwtConfig {
  abstract getJwtSecret(): string;
  abstract getJwtExpirationTime(): string;
  abstract getJwtRefreshSecret(): string;
  abstract getJwtRefreshExpirationTime(): string;
}
