export interface IDate {
  isExpired(timestamp: Date, expiryTime: number): boolean;
}
