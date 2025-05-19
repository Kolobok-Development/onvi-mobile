import { Test, TestingModule } from '@nestjs/testing';
import { StartPosUseCase } from './start-pos.use-case';
import { IOrderRepository } from '../../../domain/order/order-repository.abstract';
import { ITransactionRepository } from '../../../domain/transaction/transaction-repository.abstract';
import { IPosService } from '../../../infrastructure/pos/interface/pos.interface';
import { Logger } from 'nestjs-pino';
import { Order } from '../../../domain/order/model/order';
import { Card } from '../../../domain/account/card/model/card';
import { OrderStatus } from '../../../domain/order/enum/order-status.enum';
import {
  InvalidOrderStateException,
  OrderNotFoundException,
} from '../../../domain/order/exceptions/order-base.exceptions';
import { SendStatus } from '../../../infrastructure/order/enum/send-status.enum';
import { ICreateOrderDto } from '../../../domain/order/dto/create-order.dto';
import { validCreateCardDto } from './mock.data';

describe('StartPosUseCase', () => {
  let startPosUseCase: StartPosUseCase;
  let orderRepository: jest.Mocked<IOrderRepository>;
  let posService: jest.Mocked<IPosService>;
  let transactionRepository: jest.Mocked<ITransactionRepository>;
  let logger: jest.Mocked<Logger>;

  beforeEach(async () => {
    const mockOrderRepository = {
      findOneById: jest.fn(),
      update: jest.fn(),
    };

    const mockPosService = {
      ping: jest.fn(),
      send: jest.fn(),
    };

    const mockTransactionRepository = {
      withdraw: jest.fn(),
    };

    const mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StartPosUseCase,
        { provide: IOrderRepository, useValue: mockOrderRepository },
        { provide: IPosService, useValue: mockPosService },
        {
          provide: ITransactionRepository,
          useValue: mockTransactionRepository,
        },
        { provide: Logger, useValue: mockLogger },
      ],
    }).compile();

    startPosUseCase = module.get<StartPosUseCase>(StartPosUseCase);
    orderRepository = module.get(IOrderRepository);
    posService = module.get(IPosService);
    transactionRepository = module.get(ITransactionRepository);
    logger = module.get(Logger);
  });

  describe('execute', () => {
    let mockOrder: Order;
    const orderId = 1;

    beforeEach(() => {
      // Create a mock card
      const mockCard = Card.create(validCreateCardDto);
      mockCard.balance = 100; // Reward points balance

      // Create a mock order
      const createOrderDto = {
        carWashId: 5,
        bayNumber: 2,
        sum: 1000,
        transactionId: 'transaction-123',
        rewardPointsUsed: 0,
        promoCodeId: null,
        orderStatus: OrderStatus.PAYED,
      };

      // Create a mock order
      const orderData: ICreateOrderDto = {
        card: mockCard,
        transactionId: createOrderDto.transactionId,
        status: OrderStatus.PAYED,
        sum: createOrderDto.sum,
        promoCodeId: createOrderDto.promoCodeId,
        rewardPointsUsed: createOrderDto.rewardPointsUsed,
        carWashId: createOrderDto.carWashId,
        bayNumber: createOrderDto.bayNumber,
        cashback: 50,
      };
      mockOrder = Order.create(orderData);

      // Default mock responses
      orderRepository.findOneById.mockResolvedValue(mockOrder);

      posService.ping.mockResolvedValue({
        id: 'device-123',
        status: 'Free',
        type: 'BAY',
        errorMessage: null,
      });

      posService.send.mockResolvedValue({
        sendStatus: SendStatus.SUCCESS,
        errorMessage: '',
      });
    });

    it('should throw OrderNotFoundException when order is not found', async () => {
      // Arrange
      orderRepository.findOneById.mockResolvedValue(null);

      // Act & Assert
      await expect(startPosUseCase.execute(orderId)).rejects.toThrow(
        OrderNotFoundException,
      );
      expect(orderRepository.findOneById).toHaveBeenCalledWith(orderId);
    });

    it('should throw InvalidOrderStateException when order is not in PAYED status', async () => {
      // Arrange
      mockOrder.orderStatus = OrderStatus.CREATED;
      mockOrder.id = 151;

      // Act & Assert
      await expect(startPosUseCase.execute(orderId)).rejects.toThrow(
        InvalidOrderStateException,
      );
    });

    it('should successfully start carwash without reward points', async () => {
      // Act
      await startPosUseCase.execute(orderId);

      // Assert
      expect(posService.ping).toHaveBeenCalledWith({
        posId: mockOrder.carWashId,
        bayNumber: mockOrder.bayNumber,
      });

      expect(posService.send).toHaveBeenCalledWith({
        cardNumber: mockOrder.card.devNomer,
        sum: mockOrder.sum.toString(),
        deviceId: 'device-123',
      });

      expect(transactionRepository.withdraw).not.toHaveBeenCalled();

      expect(orderRepository.update).toHaveBeenCalledTimes(1);
      const updatedOrder = orderRepository.update.mock.calls[0][0];
      expect(updatedOrder.orderStatus).toBe(OrderStatus.COMPLETED);

      expect(logger.log).toHaveBeenCalledTimes(1);
    });

    it('should successfully withdraw reward points and start carwash', async () => {
      // Arrange
      mockOrder.rewardPointsUsed = 50;
      transactionRepository.withdraw.mockResolvedValue(true);

      // Act
      await startPosUseCase.execute(orderId);

      // Assert
      expect(transactionRepository.withdraw).toHaveBeenCalledWith(
        'device-123',
        mockOrder.card.devNomer,
        '50',
        '1',
      );

      expect(posService.send).toHaveBeenCalledWith({
        cardNumber: mockOrder.card.devNomer,
        sum: '1050', // 1000 + 50 reward points
        deviceId: 'device-123',
      });

      expect(orderRepository.update).toHaveBeenCalledTimes(1);
      const updatedOrder = orderRepository.update.mock.calls[0][0];
      expect(updatedOrder.orderStatus).toBe(OrderStatus.COMPLETED);
    });

    it('should throw RewardPointsWithdrawalException when points withdrawal fails', async () => {
      // Arrange
      mockOrder.rewardPointsUsed = 50;
      transactionRepository.withdraw.mockResolvedValue(false);

      // Act
      await startPosUseCase.execute(orderId);

      // Assert
      expect(transactionRepository.withdraw).toHaveBeenCalled();

      expect(orderRepository.update).toHaveBeenCalledTimes(1);
      const updatedOrder = orderRepository.update.mock.calls[0][0];
      expect(updatedOrder.orderStatus).toBe(OrderStatus.FAILED);
      expect(updatedOrder.excecutionError).toBeDefined();
    });

    it('should handle carwash start failure', async () => {
      // Arrange
      posService.send.mockResolvedValue({
        sendStatus: SendStatus.FAIL,
        errorMessage: 'Failed to start carwash',
      });

      // Act
      await startPosUseCase.execute(orderId);

      // Assert
      expect(posService.send).toHaveBeenCalled();

      expect(orderRepository.update).toHaveBeenCalledTimes(1);
      const updatedOrder = orderRepository.update.mock.calls[0][0];
      expect(updatedOrder.orderStatus).toBe(OrderStatus.FAILED);
      expect(updatedOrder.excecutionError).toEqual(
        expect.stringMatching(/^Failed to start carwash/)
      );

      expect(logger.log).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: mockOrder.id,
          action: 'carwash_start_failed',
        }),
        expect.any(String),
      );
    });
  });
});
