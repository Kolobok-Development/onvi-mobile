export abstract class IDate {
  abstract isExpired(timestamp: Date, expiryTime: number): boolean;
}
