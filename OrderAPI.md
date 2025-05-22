# Order API Documentation

This document provides detailed information about the Order API endpoints, request/response structures, and error handling.

## Table of Contents

- [Endpoints](#endpoints)
- [Order Creation Flow](#order-creation-flow)
- [Data Transfer Objects (DTOs)](#data-transfer-objects-dtos)
- [Error Handling](#error-handling)
- [Order Status Flow](#order-status-flow)

## Endpoints

### Create Order
Creates a new car wash order.

**Endpoint:** `POST /order/create`  
**Authentication:** JWT required

**Request Body:**
```typescript
{
  sum: number;             // Total order amount
  rewardPointsUsed: number; // Number of reward points to use
  promoCodeId?: number;    // Optional promo code ID
  carWashId: number;       // Car wash location ID
  bayNumber: number;       // Bay number at the car wash
}
```

**Response:**
```typescript
{
  orderId: number;         // Created order ID
  status: "CREATED";       // Order status
}
```

**Possible Errors:**
- `BayBusyException`: Selected bay is already in use
- `CarwashUnavalibleException`: Car wash is unavailable
- `InsufficientRewardPointsException`: Not enough reward points
- `InvalidPromoCodeException`: Promo code is invalid
- `OrderCreationFailedException`: Generic error during order creation

### Register Payment
Registers payment for an existing order.

**Endpoint:** `POST /order/register`  
**Authentication:** JWT required

**Request Body:**
```typescript
{
  orderId: number;         // Order ID
  transactionId: string;   // Transaction ID
  paymentToken: string;    // Payment token
  amount: string;          // Payment amount
  description: string;     // Payment description
  receiptReturnPhoneNumber: string; // Phone for receipt
}
```

**Response:**
```typescript
{
  status: "WAITING_PAYMENT"; // Order status
  paymentId: string;         // Payment ID
  confirmation_url: string;  // Payment confirmation URL
}
```

**Possible Errors:**
- `OrderNotFoundException`: Order with specified ID not found
- `InvalidOrderStateException`: Order is in an invalid state
- `PaymentProcessingException`: Error with payment processor

### Validate Promo Code
Validates a promo code for an order.

**Endpoint:** `POST /order/promo/validate`  
**Authentication:** JWT required

**Request Body:**
```typescript
{
  promoCode: string;      // Promo code to validate
  carWashId: number;      // Car wash ID
}
```

**Response:**
```typescript
{
  valid: boolean;         // Is promo code valid
  id?: number;            // Promo code ID if valid
  type?: string;          // Discount type if valid
  discount?: number;      // Discount amount/percentage if valid
}
```

**Possible Errors:**
- `PromoCodeNotFoundException`: Promo code not found
- `InvalidPromoCodeException`: Promo code is invalid (expired, used, etc.)

### Ping Car Wash
Checks if a car wash bay is available.

**Endpoint:** `GET /order/ping`  
**Authentication:** JWT required

**Query Parameters:**
- `carWashId`: Car wash location ID
- `bayNumber`: Bay number

**Response:**
```typescript
{
  available: boolean;     // Bay availability status
}
```

**Possible Errors:**
- `CarwashUnavalibleException`: Car wash is unavailable

### Get Order by ID
Retrieves order details by ID.

**Endpoint:** `GET /order/:id`  
**Authentication:** JWT required

**Response:**
```typescript
{
  id: number;             // Order ID
  status: string;         // Order status
  carWashId: number;      // Car wash location ID
  bayNumber: number;      // Bay number
  sum: number;            // Total amount
  cashback: number;       // Cashback amount
  card: {                 // Card details
    id: number;
    number: string;
    balance: number;      // Estimated card balance
  };
  promoCodeId?: number;   // Promo code ID if used
  discountAmount?: number; // Discount amount if applied
  rewardPointsUsed: number; // Reward points used
  createdAt: string;      // Creation timestamp
  transactionId?: string; // Transaction ID
  error?: string;         // Error message if any
}
```

**Possible Errors:**
- `OrderNotFoundException`: Order with specified ID not found

### Get Order by Transaction ID
Retrieves order details by transaction ID.

**Endpoint:** `GET /order/transaction/:transactionId`  
**Authentication:** JWT required

**Response:**
```typescript
{
  id: number;             // Order ID
  status: string;         // Order status
  carWashId: number;      // Car wash location ID
  bayNumber: number;      // Bay number
  sum: number;            // Total amount
  cashback: number;       // Cashback amount
  card: {                 // Card details
    id: number;
    number: string;
    balance: number;      // Estimated card balance
  };
  promoCodeId?: number;   // Promo code ID if used
  discountAmount?: number; // Discount amount if applied
  rewardPointsUsed: number; // Reward points used
  createdAt: string;      // Creation timestamp
  transactionId?: string; // Transaction ID
  error?: string;         // Error message if any
}
```

**Possible Errors:**
- `OrderNotFoundException`: Order with transaction ID not found

## Order Creation Flow

1. **Bay Availability Check**
   - System verifies bay availability via POS service
   - If bay is busy or car wash is unavailable, an error is returned

2. **Order Creation**
   - System creates order with initial `CREATED` status
   - Cashback is calculated based on user's tariff
   - If promo code is provided, it's validated and applied
   - If reward points are used, their availability is verified
   - Order is saved to database

3. **Payment Registration**
   - System finds order by ID
   - Verifies order is in `CREATED` state
   - Updates order to `PAYMENT_PROCESSING`
   - Registers payment with payment service
   - Updates order to `WAITING_PAYMENT` on success
   - Returns payment confirmation URL
   - On payment failure, order status is updated to `CANCELED`

4. **Payment Processing**
   - External payment system processes the payment
   - Webhook notifies our system of payment status
   - Order status is updated based on payment result
   - On successful payment, order status becomes `PAYED`
   - System communicates with POS to start car wash
   - On successful POS interaction, order becomes `COMPLETED`

## Data Transfer Objects (DTOs)

### Request DTOs

#### CreateOrderDto
```typescript
{
  sum: number;             // Total order amount (required)
  rewardPointsUsed: number; // Number of reward points to use (required)
  promoCodeId?: number;    // Optional promo code ID
  carWashId: number;       // Car wash location ID (required)
  bayNumber: number;       // Bay number at the car wash (required)
}
```

#### RegisterPaymentDto
```typescript
{
  orderId: number;         // Order ID
  transactionId: string;   // Transaction ID
  paymentToken: string;    // Payment token
  amount: string;          // Payment amount
  description: string;     // Payment description
  receiptReturnPhoneNumber: string; // Phone number for receipt
}
```

#### VerifyPromoDto
```typescript
{
  promoCode: string;       // Promo code (required)
  carWashId: number;       // Car wash ID (required)
}
```

### Response DTOs

#### Order Creation Response
```typescript
{
  orderId: number;         // Created order ID
  status: "CREATED";       // Order status
}
```

#### Payment Registration Response
```typescript
{
  status: "WAITING_PAYMENT"; // Order status
  paymentId: string;         // Payment ID
  confirmation_url: string;  // Payment confirmation URL
}
```

#### PromoVerificationResponseDto
```typescript
{
  valid: boolean;          // Indicates validity
  id?: number;             // Promo code ID if valid
  type?: string;           // Discount type if valid
  discount?: number;       // Discount amount/percentage if valid
}
```

#### Order Details Response
```typescript
{
  id: number;              // Order ID
  status: string;          // Order status
  carWashId: number;       // Car wash location ID
  bayNumber: number;       // Bay number
  sum: number;             // Total amount
  cashback: number;        // Cashback amount
  card: {                  // Card details
    id: number;
    number: string;
    balance: number;       // Estimated card balance
  };
  promoCodeId?: number;    // Promo code ID if used
  discountAmount?: number; // Discount amount if applied
  rewardPointsUsed: number; // Reward points used
  createdAt: string;       // Creation timestamp
  transactionId?: string;  // Transaction ID
  error?: string;          // Error message if any
}
```

## Error Handling

All API errors follow a standardized format:

```json
{
  "code": 1000,           // Numeric error code
  "type": "api_client",   // Error type 
  "message": "Order with ID 12345 not found", // Human-readable message
  "source": "api_client", // Error source
  "timestamp": "2023-06-01T12:34:56.789Z", // When the error occurred
  "path": "/api/orders/12345", // API endpoint
  "requestId": "req_1685624096789_abc123def456" // Request tracking ID
}
```

### Error Codes and Exceptions

#### Order-specific Errors

| Error Code | Exception | HTTP Status | Description |
|------------|-----------|-------------|-------------|
| 1000 | `OrderNotFoundException` | 404 | Order with specified ID not found |
| 1001 | `InvalidOrderStateException` | 400 | Order is in an invalid state for operation |
| 1002 | `PaymentCanceledException` | 400 | Payment was canceled |
| 1003 | `PaymentTimeoutException` | 408 | Payment verification timed out |
| 1004 | `OrderCreationFailedException` | 500 | Failed to create order |
| 1005 | `InsufficientRewardPointsException` | 400 | Not enough reward points |
| 1006 | `RewardPointsWithdrawalException` | 500 | Failed to withdraw reward points |
| 81 | `BayBusyException` | 409 | Selected bay is already in use |
| 89 | `CarwashUnavalibleException` | 503 | Car wash is unavailable |
| 1100 | `PosStartFailedException` | 500 | Failed to start car wash |
| 995 | `OrderProcessingException` | 500 | Generic order processing error |

#### Promo Code Errors

| Error Code | Exception | HTTP Status | Description |
|------------|-----------|-------------|-------------|
| 2000 | `PromoCodeNotFoundException` | 404 | Promo code not found |
| 2001 | `InvalidPromoCodeException` | 400 | Promo code is invalid (expired, used, etc.) |

### Example Error Responses

#### Order Not Found
```json
{
  "code": 1000,
  "type": "api_client",
  "message": "Order with ID 12345 not found",
  "source": "api_client",
  "timestamp": "2023-06-01T12:34:56.789Z",
  "path": "/api/orders/12345",
  "requestId": "req_1685624096789_abc123def456"
}
```

#### Bay Busy
```json
{
  "code": 81,
  "type": "api_client",
  "message": "Selected bay is currently busy",
  "source": "pos_system",
  "timestamp": "2023-06-01T12:34:56.789Z",
  "path": "/api/order/create",
  "requestId": "req_1685624096789_def456abc123"
}
```

#### Insufficient Reward Points
```json
{
  "code": 1005,
  "type": "api_client",
  "message": "Insufficient reward points. Available: 100, Requested: 200",
  "source": "api_client",
  "timestamp": "2023-06-01T12:34:56.789Z",
  "path": "/api/order/create",
  "requestId": "req_1685624096789_ghi789jkl012"
}
```

## Order Status Flow

Orders progress through the following statuses:

1. `CREATED` - Initial state when order is created
2. `PAYMENT_PROCESSING` - Payment is being processed
3. `WAITING_PAYMENT` - Waiting for payment confirmation
4. `PAYMENT_AUTHORIZED` - Payment has been authorized
5. `PAYED` - Payment completed
6. `FAILED` - Order processing failed
7. `COMPLETED` - Order successfully completed
8. `CANCELED` - Order was canceled
9. `REFUNDED` - Payment was refunded

Status transitions follow this general flow:

```
CREATED → PAYMENT_PROCESSING → WAITING_PAYMENT → PAYMENT_AUTHORIZED → PAYED → COMPLETED
                                    ↓
                                  FAILED/CANCELED
```

In case of errors or cancellation, the order may transition to `FAILED` or `CANCELED` from various states.