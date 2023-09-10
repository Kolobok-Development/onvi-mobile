export class CreatePaymentDto {
  paymentToken: string;
  amount: string;
  currency?: string;
  capture?: boolean;
  description?: string;
}
