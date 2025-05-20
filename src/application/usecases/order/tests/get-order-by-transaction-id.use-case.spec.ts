import { Test, TestingModule } from '@nestjs/testing';
import { GetOrderByTransactionIdUseCase } from '../get-order-by-transaction-id.use-case';
import { IOrderRepository } from '../../../../domain/order/order-repository.abstract';
import { Logger } from 'nestjs-pino';
import { OrderNotFoundException } from '../../../../domain/order/exceptions/order-base.exceptions';
import { Order } from '../../../../domain/order/model/order';
import { OrderStatus } from '../../../../domain/order/enum/order-status.enum';

describe('GetOrderByTransactionIdUseCase', () => {
  let useCase: GetOrderByTransactionIdUseCase;
  let orderRepository: IOrderRepository;
  let logger: Logger;

  const mockOrder = {
    id: 1,
    orderStatus: OrderStatus.PAYED,
    carWashId: 123,
    bayNumber: 2,
    sum: 500,
    cashback: 50,
    card: {
      cardId: 789,
      devNomer: '1234567890',
      balance: 1000,
    },
    promoCodeId: null,
    discountAmount: null,
    rewardPointsUsed: 0,
    createdAt: new Date(),
    transactionId: 'txn_12345',
    excecutionError: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetOrderByTransactionIdUseCase,
        {
          provide: IOrderRepository,
          useValue: {
            findByTransactionId: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetOrderByTransactionIdUseCase>(GetOrderByTransactionIdUseCase);
    orderRepository = module.get<IOrderRepository>(IOrderRepository);
    logger = module.get<Logger>(Logger);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return order details when found by transaction ID', async () => {
      jest.spyOn(orderRepository, 'findByTransactionId').mockResolvedValue(mockOrder as Order);

      const result = await useCase.execute('txn_12345');

      expect(orderRepository.findByTransactionId).toHaveBeenCalledWith('txn_12345');
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
          balance: mockOrder.card.balance,
        },
        promoCodeId: mockOrder.promoCodeId,
        discountAmount: mockOrder.discountAmount,
        rewardPointsUsed: mockOrder.rewardPointsUsed,
        createdAt: mockOrder.createdAt,
        transactionId: mockOrder.transactionId,
        error: mockOrder.excecutionError,
      });
      expect(logger.log).toHaveBeenCalled();
    });

    it('should throw OrderNotFoundException when order not found', async () => {
      jest.spyOn(orderRepository, 'findByTransactionId').mockResolvedValue(null);

      await expect(useCase.execute('non_existent_txn')).rejects.toThrow(OrderNotFoundException);
      expect(orderRepository.findByTransactionId).toHaveBeenCalledWith('non_existent_txn');
    });

    it('should calculate estimated card balance when reward points are used', async () => {
      const orderWithPoints = {
        ...mockOrder,
        rewardPointsUsed: 200,
      };
      jest.spyOn(orderRepository, 'findByTransactionId').mockResolvedValue(orderWithPoints as Order);

      const result = await useCase.execute('txn_12345');

      expect(result.card.balance).toBe(orderWithPoints.card.balance - orderWithPoints.rewardPointsUsed);
    });

    it('should handle null card information', async () => {
      const orderWithoutCard = {
        ...mockOrder,
        card: null,
      };
      jest.spyOn(orderRepository, 'findByTransactionId').mockResolvedValue(orderWithoutCard as Order);

      const result = await useCase.execute('txn_12345');

      expect(result.card).toBeNull();
    });
  });
});
