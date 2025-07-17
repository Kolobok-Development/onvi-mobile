export type Amount = {
  value: string;
  currency: string;
};

export type Recipient = {
  account_id: string;
  gateway_id: string;
};

export type Card = {
  // Define card properties based on your needs
  // Example:
  first6?: string;
  last4?: string;
  expiry_month?: string;
  expiry_year?: string;
  card_type?: string;
};

export type PaymentMethod = {
  type: string;
  id: string;
  saved: boolean;
  status: string;
  title: string;
  card: Card;
};

export type AuthorizationDetails = {
  rrn: string;
  auth_code: string;
  three_d_secure: {
    // Define 3D Secure properties based on your needs
    // Example:
    applied: boolean;
  };
};

export type PaymentObject = {
  id: string;
  status: string;
  amount: Amount;
  income_amount: Amount;
  description: string;
  recipient: Recipient;
  payment_method: PaymentMethod;
  captured_at: string;
  created_at: string;
  test: boolean;
  refunded_amount: Amount;
  paid: boolean;
  refundable: boolean;
  metadata: Record<string, any>;
  authorization_details: AuthorizationDetails;
  merchant_customer_id: string;
};

export type PaymentStatusGatewayWebhookDto = {
  type: 'notification';
  event: 'payment.succeeded' | 'payment.canceled' | string; // string allows for other event types
  object: PaymentObject;
};
