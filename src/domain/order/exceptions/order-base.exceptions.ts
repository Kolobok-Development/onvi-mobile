import { ClientException } from '../../../infrastructure/common/exceptions/base.exceptions';
import { ORDER_ERROR_CODES } from '../../../infrastructure/common/constants/constants';

export class OrderNotFoundException extends ClientException {
  constructor(orderId: string) {
    super(
      ORDER_ERROR_CODES.ORDER_NOT_FOUND,
      `Order with ID ${orderId} not found`,
    );
  }
}

export class OrderNotFoundByTransactionIdException extends ClientException {
  constructor(transactionId: string) {
    super(
      ORDER_ERROR_CODES.ORDER_NOT_FOUND,
      `Order with transactionId ${transactionId} not found`,
    );
  }
}

export class InvalidOrderStateException extends ClientException {
  constructor(orderId: string, currentState: string, expectedState: string) {
    super(
      ORDER_ERROR_CODES.INVALID_ORDER_STATE,
      `Order ${orderId} is in ${currentState} state, expected ${expectedState}`,
    );
  }
}

export class PaymentCanceledException extends ClientException {
  constructor(transactionId: string) {
    super(
      ORDER_ERROR_CODES.PAYMENT_CANCELED,
      `Payment was canceled for transaction: ${transactionId}`,
    );
  }
}

export class PaymentTimeoutException extends ClientException {
  constructor(transactionId: string) {
    super(
      ORDER_ERROR_CODES.PAYMENT_TIMEOUT,
      `Payment verification timed out for transaction: ${transactionId}`,
    );
  }
}

export class OrderCreationFailedException extends ClientException {
  constructor(message?: string) {
    super(
      ORDER_ERROR_CODES.ORDER_CREATION_FAILED,
      `Failed to create order${message ? `: ${message}` : ''}`,
    );
  }
}

export class InsufficientRewardPointsException extends ClientException {
  constructor() {
    super(
      ORDER_ERROR_CODES.INSUFFICIENT_REWARD_POINTS,
      'Insufficient reward points balance',
    );
  }
}

export class RewardPointsWithdrawalException extends ClientException {
  constructor() {
    super(
      ORDER_ERROR_CODES.REWARD_POINTS_WITHDRAWAL_FAILED,
      'Failed to withdraw reward points',
    );
  }
}

export class CardForOrderNotFoundException extends ClientException {
  constructor(orderId: string) {
    super(
      ORDER_ERROR_CODES.CARD_FOR_ORDER_NOT_FOUND,
      `Card not found an order with ID ${orderId}`,
    );
  }
}

export class CashbackAccrualException extends ClientException {
  constructor(orderId: string) {
    super(
      ORDER_ERROR_CODES.CASHBACK_ACCRUAL_FAILED,
      `Failed to accrue cashback for order ${orderId}`,
    );
  }
}
