import { Test, TestingModule } from '@nestjs/testing';
import { CreateOrderUseCase } from './create-order.use-case';
import { IOrderRepository } from '../../../domain/order/order-repository.abstract';
import { ITransactionRepository } from '../../../domain/transaction/transaction-repository.abstract';
import { PromoCodeService } from '../../services/promocode-service';
import { PaymentUsecase } from '../payment/payment.usecase';
import { ITariffRepository } from '../../../domain/account/card/tariff-repository.abstract';
import { IPosService } from '../../../infrastructure/pos/interface/pos.interface';
import { Client } from '../../../domain/account/client/model/client';
import { Card } from '../../../domain/account/card/model/card';
import { Tariff } from '../../../domain/account/card/model/tariff';
import { Order } from '../../../domain/order/model/order';
import { CreateOrderDto } from './dto/create-order.dto';
import { BayBusyException } from '../../../domain/order/exceptions/bay-busy.exception';
import { CarwashUnavalibleException } from '../../../domain/order/exceptions/carwash-unavalible.exception';
import { InsufficientRewardPointsException } from '../../../domain/order/exceptions/insufficient-reward-roints.exception';
import { RewardPointsWithdrawalException } from '../../../domain/order/exceptions/reward-points-withdrawal.exception';
import { OrderStatus } from '../../../domain/order/enum/order-status.enum';
import { SendStatus } from '../../../infrastructure/order/enum/send-status.enum';

describe('CreateOrderUseCase', () => {
  let createOrderUseCase: CreateOrderUseCase;
  let orderRepository: jest.Mocked<IOrderRepository>;
  let transactionRepository: jest.Mocked<ITransactionRepository>;
  let promoCodeService: jest.Mocked<PromoCodeService>;
  let paymentUsecase: jest.Mocked<PaymentUsecase>;
  let tariffRepository: jest.Mocked<ITariffRepository>;
  let posService: jest.Mocked<IPosService>;

  beforeEach(async () => {
    const mockOrderRepository = {
      create: jest.fn(),
      updateOrderStatus: jest.fn(),
      setExcecutionError: jest.fn(),
    };

    const mockTransactionRepository = {
      withdraw: jest.fn(),
    };

    const mockPromoCodeService = {
      applyPromoCode: jest.fn(),
    };

    const mockPaymentUsecase = {
      verify: jest.fn(),
    };

    const mockTariffRepository = {
      findCardTariff: jest.fn(),
    };

    const mockPosService = {
      ping: jest.fn(),
      send: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateOrderUseCase,
        { provide: IOrderRepository, useValue: mockOrderRepository },
        { provide: ITransactionRepository, useValue: mockTransactionRepository },
        { provide: PromoCodeService, useValue: mockPromoCodeService },
        { provide: PaymentUsecase, useValue: mockPaymentUsecase },
        { provide: ITariffRepository, useValue: mockTariffRepository },
        { provide: IPosService, useValue: mockPosService },
      ],
    }).compile();

    createOrderUseCase = module.get<CreateOrderUseCase>(CreateOrderUseCase);
    orderRepository = module.get(IOrderRepository);
    transactionRepository = module.get(ITransactionRepository);
    promoCodeService = module.get(PromoCodeService);
    paymentUsecase = module.get(PaymentUsecase);
    tariffRepository = module.get(ITariffRepository);
    posService = module.get(IPosService);
  });

  describe('execute', () => {
    let mockClient: Client;
    let mockCard: Card;
    let mockTariff: Tariff;
    let createOrderDto: CreateOrderDto;

    beforeEach(() => {
      mockCard = new Card();
      mockCard.cardId = 123;
      mockCard.devNomer = '123456789012';
      mockCard.balance = 100; // Reward points balance
      
      mockClient = new Client();
      mockClient.clientId = 1;
      mockClient.getCard = jest.fn().mockReturnValue(mockCard);
      
      mockTariff = new Tariff();
      mockTariff.bonus = 5; // 5% cashback
      
      createOrderDto = {
        carWashId: 1,
        bayNumber: 2,
        sum: 1000,
        transactionId: 'transaction-123',
        rewardPointsUsed: 0,
        promoCodeId: null,
      };
      
      // Mock the bay availability check - Available
      posService.ping.mockResolvedValue({
        id: 'device-123',
        status: 'Available',
        message: 'OK',
      });
      
      // Mock the tariff check
      tariffRepository.findCardTariff.mockResolvedValue(mockTariff);
      
      // Mock the order creation
      const newOrder = Order.create({
        card: mockCard,
        transactionId: createOrderDto.transactionId,
        sum: createOrderDto.sum,
        promoCodeId: createOrderDto.promoCodeId,
        rewardPointsUsed: createOrderDto.rewardPointsUsed,
        carWashId: createOrderDto.carWashId,
        bayNumber: createOrderDto.bayNumber,
        cashback: 50, // 5% of 1000
      });
      newOrder.id = 1;
      orderRepository.create.mockResolvedValue(newOrder);
      
      // Mock the car wash response
      posService.send.mockResolvedValue({
        sendStatus: SendStatus.SUCCESS,
        errorMessage: '',
      });
    });

    it('should throw BayBusyException when bay is busy', async () => {
      // Arrange
      posService.ping.mockResolvedValue({
        id: 'device-123',
        status: 'Busy',
        message: 'Bay is busy',
      });

      // Act & Assert
      await expect(createOrderUseCase.execute(createOrderDto, mockClient)).rejects.toThrow(
        BayBusyException,
      );
      expect(posService.ping).toHaveBeenCalledWith({
        posId: createOrderDto.carWashId,
        bayNumber: createOrderDto.bayNumber,
      });
    });

    it('should throw CarwashUnavalibleException when car wash is unavailable', async () => {
      // Arrange
      posService.ping.mockResolvedValue({
        id: 'device-123',
        status: 'Unavailable',
        message: 'Car wash is unavailable',
      });

      // Act & Assert
      await expect(createOrderUseCase.execute(createOrderDto, mockClient)).rejects.toThrow(
        CarwashUnavalibleException,
      );
    });

    it('should create an order successfully without promo code or reward points', async () => {
      // Act
      const result = await createOrderUseCase.execute(createOrderDto, mockClient);

      // Assert
      expect(tariffRepository.findCardTariff).toHaveBeenCalledWith(mockCard);
      expect(orderRepository.create).toHaveBeenCalled();
      expect(posService.send).toHaveBeenCalledWith({
        cardNumber: mockCard.devNomer,
        sum: '1000',
        deviceId: 'device-123',
      });
      expect(orderRepository.updateOrderStatus).toHaveBeenCalledWith(1, OrderStatus.COMPLETED);
      expect(result).toEqual({
        sendStatus: SendStatus.SUCCESS,
        errorMessage: '',
      });
    });

    it('should apply promo code when promoCodeId is provided', async () => {
      // Arrange
      createOrderDto.promoCodeId = 999;
      promoCodeService.applyPromoCode.mockResolvedValue(100); // 100 units discount

      // Act
      await createOrderUseCase.execute(createOrderDto, mockClient);

      // Assert
      expect(promoCodeService.applyPromoCode).toHaveBeenCalled();
      expect(orderRepository.create).toHaveBeenCalled();
      expect(posService.send).toHaveBeenCalled();
    });

    it('should withdraw reward points when reward points are used', async () => {
      // Arrange
      createOrderDto.rewardPointsUsed = 50;
      transactionRepository.withdraw.mockResolvedValue(true);

      // Act
      await createOrderUseCase.execute(createOrderDto, mockClient);

      // Assert
      expect(transactionRepository.withdraw).toHaveBeenCalledWith(
        'device-123',
        mockCard.devNomer,
        '50',
        '1',
      );
      expect(orderRepository.create).toHaveBeenCalled();
      expect(posService.send).toHaveBeenCalledWith({
        cardNumber: mockCard.devNomer,
        sum: '1050', // 1000 + 50 reward points
        deviceId: 'device-123',
      });
    });

    it('should throw InsufficientRewardPointsException when card balance is less than reward points used', async () => {
      // Arrange
      createOrderDto.rewardPointsUsed = 150; // More than card balance (100)

      // Act & Assert
      await expect(createOrderUseCase.execute(createOrderDto, mockClient)).rejects.toThrow(
        InsufficientRewardPointsException,
      );
      expect(orderRepository.create).toHaveBeenCalled(); // Order is still created
      expect(transactionRepository.withdraw).not.toHaveBeenCalled(); // Withdrawal is not attempted
    });

    it('should throw RewardPointsWithdrawalException when points withdrawal fails', async () => {
      // Arrange
      createOrderDto.rewardPointsUsed = 50;
      transactionRepository.withdraw.mockResolvedValue(false); // Withdrawal fails

      // Act & Assert
      await expect(createOrderUseCase.execute(createOrderDto, mockClient)).rejects.toThrow(
        RewardPointsWithdrawalException,
      );
      expect(orderRepository.create).toHaveBeenCalled();
      expect(transactionRepository.withdraw).toHaveBeenCalled();
    });

    it('should throw CarwashUnavalibleException and update order status when car wash send fails', async () => {
      // Arrange
      posService.send.mockResolvedValue({
        sendStatus: SendStatus.FAIL,
        errorMessage: 'Failed to process order',
      });

      // Act & Assert
      await expect(createOrderUseCase.execute(createOrderDto, mockClient)).rejects.toThrow(
        CarwashUnavalibleException,
      );
      expect(orderRepository.create).toHaveBeenCalled();
      expect(orderRepository.updateOrderStatus).toHaveBeenCalledWith(1, OrderStatus.CANCELED);
      expect(orderRepository.setExcecutionError).toHaveBeenCalledWith(1, 'Failed to process order');
    });

    it('should throw error when order creation fails', async () => {
      // Arrange
      orderRepository.create.mockResolvedValue(null); // Order creation fails

      // Act & Assert
      await expect(createOrderUseCase.execute(createOrderDto, mockClient)).rejects.toThrow(
        'Failed to create order.'
      );
    });

    it('should calculate correct cashback amount based on tariff', async () => {
      // Arrange
      mockTariff.bonus = 10; // 10% cashback
      createOrderDto.sum = 500;

      // Act
      await createOrderUseCase.execute(createOrderDto, mockClient);

      // Assert
      // The cashback should be 10% of 500 = 50, rounded up if necessary
      const order = orderRepository.create.mock.calls[0][0];
      expect(order.cashback).toBe(50);
    });
  });
});