import { Provider } from "@nestjs/common";
import { IRefundPaymentRepository } from "src/domain/payment/refund-payment-repository.abstract";
import { RefundRepository } from "../repository/refund-payment.repository";

export const RefundRepositoryProvider: Provider = {
  provide: IRefundPaymentRepository,
  useClass: RefundRepository
}