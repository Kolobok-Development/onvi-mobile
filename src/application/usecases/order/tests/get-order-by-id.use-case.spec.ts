import { Test, TestingModule } from '@nestjs/testing';
import { GetOrderByIdUseCase } from '../get-order-by-id.use-case';
import { IOrderRepository } from '../../../../domain/order/order-repository.abstract';
import { Logger } from 'nestjs-pino';
import { Order } from '../../../../domain/order/model/order';
import { Card } from '../../../../domain/account/card/model/card';
import { OrderStatus } from '../../../../domain/order/enum/order-status.enum';
import { OrderNotFoundException } from '../../../../domain/order/exceptions/order-base.exceptions';
import { validCreateCardDto } from './mock.data';
import { ICreateOrderDto } from '../../../../domain/order/dto/create-order.dto';

describe('GetOrderByIdUseCase', () => {
  let getOrderByIdUseCase: GetOrderByIdUseCase;
  let orderRepository: jest.Mocked<IOrderRepository>;
  let logger: jest.Mocked<Logger>;

  beforeEach(async () => {
    const mockOrderRepository = {
      findOneById: jest.fn(),
    };

    const mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetOrderByIdUseCase,
        { provide: IOrderRepository, useValue: mockOrderRepository },
        { provide: Logger, useValue: mockLogger },
      ],
    }).compile();

    getOrderByIdUseCase = module.get<GetOrderByIdUseCase>(GetOrderByIdUseCase);
    orderRepository = module.get(IOrderRepository);
    logger = module.get(Logger);
  });

  describe('execute', () => {
    let mockOrder: Order;
    const orderId = 1;

    beforeEach(() => {
      // Create a mock card
      const mockCard = Card.create(validCreateCardDto);
      mockCard.balance = 100;

      // Create a mock order
      const orderData: ICreateOrderDto = {
        card: mockCard,
        transactionId: 'transaction-123',
        status: OrderStatus.COMPLETED,
        sum: 1000,
        promoCodeId: 999,
        rewardPointsUsed: null,
        carWashId: 5,
        bayNumber: 2,
        cashback: 50,
      };
      mockOrder = Order.create(orderData);
      mockOrder.id = orderId;
      mockOrder.createdAt = new Date();
      mockOrder.discountAmount = 100;
    });

    it('should throw OrderNotFoundException when order is not found', async () => {
      // Arrange
      orderRepository.findOneById.mockResolvedValue(null);

      // Act & Assert
      await expect(getOrderByIdUseCase.execute(orderId)).rejects.toThrow(
        OrderNotFoundException,
      );
      expect(orderRepository.findOneById).toHaveBeenCalledWith(orderId);
    });

    it('should successfully return order details', async () => {
      // Arrange
      orderRepository.findOneById.mockResolvedValue(mockOrder);

      // Act
      const result = await getOrderByIdUseCase.execute(orderId);

      // Assert
      expect(orderRepository.findOneById).toHaveBeenCalledWith(orderId);
      expect(logger.log).toHaveBeenCalled();

      // Verify the returned object structure
      expect(result).toEqual({
        id: mockOrder.id,
        status: mockOrder.orderStatus,
        carWashId: mockOrder.carWashId,
        bayNumber: mockOrder.bayNumber,
        sum: mockOrder.sum,
        cashback: mockOrder.cashback,
        card: {
          id: mockOrder.card.cardId,
          number: mockOrder.card.devNomer,
        },
        promoCodeId: mockOrder.promoCodeId,
        discountAmount: mockOrder.discountAmount,
        rewardPointsUsed: mockOrder.rewardPointsUsed,
        createdAt: mockOrder.createdAt,
        transactionId: mockOrder.transactionId,
        error: mockOrder.excecutionError,
      });
    });
  });
});
