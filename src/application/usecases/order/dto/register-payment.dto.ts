export interface IRegisterPaymentDto {
  orderId: number;
  transactionId: string;
  paymentToken: string;
  amount: string;
  description: string;
  receiptReturnPhoneNumber: string;
}
