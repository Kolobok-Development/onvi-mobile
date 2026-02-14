export abstract class INotificationService {
  abstract sendHealthCheckAlert(
    checkType: string,
    status: string,
    details: any,
  ): Promise<boolean>;
}
