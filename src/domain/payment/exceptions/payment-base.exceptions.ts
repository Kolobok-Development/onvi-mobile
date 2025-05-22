import { ClientException } from '../../../infrastructure/common/exceptions/base.exceptions';
import { PAYMENT_ERROR_CODES } from '../../../infrastructure/common/constants/constants';

export class PaymentRegistrationFailedException extends ClientException {
  constructor(message: string) {
    super(
      PAYMENT_ERROR_CODES.PAYMENT_REGISTRATION_FAILED,
      `Payment registration failed: ${message}`,
    );
  }
}

export class InvalidWebhookSignatureException extends ClientException {
  constructor() {
    super(
      PAYMENT_ERROR_CODES.INVALID_WEBHOOK_SIGNATURE,
      'Invalid webhook signature',
    );
  }
}

export class MissingOrderIdException extends ClientException {
  constructor() {
    super(
      PAYMENT_ERROR_CODES.MISSING_ORDER_ID,
      'Order ID is missing in webhook metadata',
    );
  }
}

export class MissingPaymentIdException extends ClientException {
  constructor(orderId: string) {
    super(
      PAYMENT_ERROR_CODES.MISSING_PAYMENT_ID,
      `Order ${orderId} does not have a payment ID`,
    );
  }
}

export class RefundFailedException extends ClientException {
  constructor(message: string) {
    super(PAYMENT_ERROR_CODES.REFUND_FAILED, `Refund failed: ${message}`);
  }
}
