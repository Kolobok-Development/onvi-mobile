import { Test, TestingModule } from '@nestjs/testing';
import { RegisterPaymentUseCase } from './register-payment.use-case';
import { IOrderRepository } from '../../../domain/order/order-repository.abstract';
import { PaymentUsecase } from '../payment/payment.usecase';
import { Logger } from 'nestjs-pino';
import { IRegisterPaymentDto } from './dto/register-payment.dto';
import { OrderStatus } from '../../../domain/order/enum/order-status.enum';
import { Order } from '../../../domain/order/model/order';
import { Card } from '../../../domain/account/card/model/card';
import {
  InvalidOrderStateException,
  OrderNotFoundException,
} from '../../../domain/order/exceptions/order-base.exceptions';
import { PaymentRegistrationFailedException } from '../../../domain/payment/exceptions/payment-base.exceptions';
import { validCreateCardDto } from './mock.data';
import { ICreateOrderDto } from '../../../domain/order/dto/create-order.dto';

describe('RegisterPaymentUseCase', () => {
  let registerPaymentUseCase: RegisterPaymentUseCase;
  let orderRepository: jest.Mocked<IOrderRepository>;
  let paymentUsecase: jest.Mocked<PaymentUsecase>;
  let logger: jest.Mocked<Logger>;

  beforeEach(async () => {
    const mockOrderRepository = {
      findOneById: jest.fn(),
      update: jest.fn(),
    };

    const mockPaymentUsecase = {
      create: jest.fn(),
    };

    const mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterPaymentUseCase,
        { provide: IOrderRepository, useValue: mockOrderRepository },
        { provide: PaymentUsecase, useValue: mockPaymentUsecase },
        { provide: Logger, useValue: mockLogger },
      ],
    }).compile();

    registerPaymentUseCase = module.get<RegisterPaymentUseCase>(
      RegisterPaymentUseCase,
    );
    orderRepository = module.get(IOrderRepository);
    paymentUsecase = module.get(PaymentUsecase);
    logger = module.get(Logger);
  });

  describe('execute', () => {
    let mockOrder: Order;
    let registerPaymentDto: IRegisterPaymentDto;

    beforeEach(() => {
      // Create a mock card
      const mockCard = Card.create(validCreateCardDto);

      const createOrderDto = {
        carWashId: 1,
        bayNumber: 2,
        sum: 1000,
        transactionId: 'transaction-123',
        rewardPointsUsed: 0,
        promoCodeId: null,
      };

      // Create a mock order
      const orderData: ICreateOrderDto = {
        card: mockCard,
        transactionId: createOrderDto.transactionId,
        status: OrderStatus.CREATED,
        sum: createOrderDto.sum,
        promoCodeId: createOrderDto.promoCodeId,
        rewardPointsUsed: createOrderDto.rewardPointsUsed,
        carWashId: createOrderDto.carWashId,
        bayNumber: createOrderDto.bayNumber,
        cashback: 50,
      };
      mockOrder = Order.create(orderData);

      // Create the DTO for registration
      registerPaymentDto = {
        orderId: 1,
        transactionId: 'transaction-123',
        paymentToken: 'payment-token-123',
        amount: '1000',
        description: 'Заказ на мойку Пост 2',
        receiptReturnPhoneNumber: '+79123456789',
      };
    });

    it('should throw OrderNotFoundException when order is not found', async () => {
      // Arrange
      orderRepository.findOneById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        registerPaymentUseCase.execute(registerPaymentDto),
      ).rejects.toThrow(OrderNotFoundException);
      expect(orderRepository.findOneById).toHaveBeenCalledWith(
        registerPaymentDto.orderId,
      );
    });

    it('should throw InvalidOrderStateException when order is not in CREATED status', async () => {
      // Arrange
      mockOrder.orderStatus = OrderStatus.PAYMENT_PROCESSING;
      mockOrder.id = 151;
      orderRepository.findOneById.mockResolvedValue(mockOrder);

      // Act & Assert
      await expect(
        registerPaymentUseCase.execute(registerPaymentDto),
      ).rejects.toThrow(InvalidOrderStateException);
    });

    it('should successfully register payment and return confirmation URL', async () => {
      // Arrange
      orderRepository.findOneById.mockResolvedValue(mockOrder);
      orderRepository.update.mockResolvedValue();

      const paymentResult = {
        id: 'payment-id-123',
        confirmation: {
          confirmation_url: 'https://payment-gateway.com/confirm/123',
        },
      };

      paymentUsecase.create.mockResolvedValue(paymentResult);

      // Act
      const result = await registerPaymentUseCase.execute(registerPaymentDto);

      // Assert
      // Verify order state transitions
      expect(orderRepository.update).toHaveBeenCalledTimes(2);

      // First update should set order to PAYMENT_PROCESSING
      const firstUpdateOrder = orderRepository.update.mock.calls[0][0];
      expect(firstUpdateOrder.orderStatus).toBe(OrderStatus.PAYMENT_PROCESSING);
      expect(firstUpdateOrder.transactionId).toBe(
        registerPaymentDto.transactionId,
      );

      // Second update should set order to WAITING_PAYMENT
      const secondUpdateOrder = orderRepository.update.mock.calls[1][0];
      expect(secondUpdateOrder.orderStatus).toBe(OrderStatus.WAITING_PAYMENT);

      // Verify payment creation
      expect(paymentUsecase.create).toHaveBeenCalledWith(
        {
          paymentToken: registerPaymentDto.paymentToken,
          amount: registerPaymentDto.amount,
          description: `Оплата за мойку, пост № ${mockOrder.bayNumber}`,
        },
        registerPaymentDto.receiptReturnPhoneNumber,
      );

      // Verify successful result
      expect(result).toEqual({
        status: OrderStatus.WAITING_PAYMENT,
        paymentId: paymentResult.id,
        confirmation_url: paymentResult.confirmation.confirmation_url,
      });

      // Verify logger was called
      expect(logger.log).toHaveBeenCalledTimes(2);
    });

    it('should handle payment service errors and update order status to CANCELED', async () => {
      // Arrange
      orderRepository.findOneById.mockResolvedValue(mockOrder);

      const paymentError = new Error('Payment service unavailable');
      paymentUsecase.create.mockRejectedValue(paymentError);

      // Act & Assert
      await expect(
        registerPaymentUseCase.execute(registerPaymentDto),
      ).rejects.toThrow(PaymentRegistrationFailedException);

      // Verify order updates
      expect(orderRepository.update).toHaveBeenCalledTimes(2);

      // First update should set order to PAYMENT_PROCESSING
      const firstUpdateOrder = orderRepository.update.mock.calls[0][0];
      expect(firstUpdateOrder.orderStatus).toBe(OrderStatus.PAYMENT_PROCESSING);

      // Second update should set order to CANCELED and include error
      const secondUpdateOrder = orderRepository.update.mock.calls[1][0];
      expect(secondUpdateOrder.orderStatus).toBe(OrderStatus.CANCELED);
      expect(secondUpdateOrder.excecutionError).toBe(paymentError.message);

      // Verify logger was called
      expect(logger.log).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledTimes(1);
    });
  });
});
