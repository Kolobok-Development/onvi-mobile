export interface IRegisterPaymentDto {
  orderId: number;
  paymentToken: string;
  amount: string;
  description: string;
  receiptReturnPhoneNumber: string;
}
