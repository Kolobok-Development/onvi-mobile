import { Test, TestingModule } from '@nestjs/testing';
import { CreateOrderUseCase } from '../create-order.use-case';
import { IOrderRepository } from '../../../../domain/order/order-repository.abstract';
import { PromoCodeService } from '../../../services/promocode-service';
import { ITariffRepository } from '../../../../domain/account/card/tariff-repository.abstract';
import { IPosService } from '../../../../infrastructure/pos/interface/pos.interface';
import { Client } from '../../../../domain/account/client/model/client';
import { Card } from '../../../../domain/account/card/model/card';
import { Tariff } from '../../../../domain/account/card/model/tariff';
import { Order } from '../../../../domain/order/model/order';
import { CreateOrderDto } from '../dto/create-order.dto';
import { BayBusyException } from '../../../../domain/order/exceptions/bay-busy.exception';
import { CarwashUnavalibleException } from '../../../../domain/order/exceptions/carwash-unavalible.exception';
import { InsufficientRewardPointsException } from '../../../../domain/order/exceptions/insufficient-reward-roints.exception';
import { OrderStatus } from '../../../../domain/order/enum/order-status.enum';
import { SendStatus } from '../../../../infrastructure/order/enum/send-status.enum';
import {
  standardTariff,
  validCreateCardDto,
  validCreateClientDto,
} from './mock.data';
import { ICreateOrderDto } from '../../../../domain/order/dto/create-order.dto';
import { Logger } from 'nestjs-pino';

describe('CreateOrderUseCase', () => {
  let createOrderUseCase: CreateOrderUseCase;
  let orderRepository: jest.Mocked<IOrderRepository>;
  let promoCodeService: jest.Mocked<PromoCodeService>;
  let tariffRepository: jest.Mocked<ITariffRepository>;
  let posService: jest.Mocked<IPosService>;
  let logger: jest.Mocked<Logger>;

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

    const mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateOrderUseCase,
        { provide: IOrderRepository, useValue: mockOrderRepository },
        { provide: Logger, useValue: mockLogger },
        { provide: PromoCodeService, useValue: mockPromoCodeService },
        { provide: ITariffRepository, useValue: mockTariffRepository },
        { provide: IPosService, useValue: mockPosService },
      ],
    }).compile();

    createOrderUseCase = module.get<CreateOrderUseCase>(CreateOrderUseCase);
    orderRepository = module.get(IOrderRepository);
    promoCodeService = module.get(PromoCodeService);
    tariffRepository = module.get(ITariffRepository);
    posService = module.get(IPosService);
  });

  describe('execute', () => {
    let mockClient: Client;
    let mockCard: Card;
    let mockTariff: Tariff;
    let createOrderDto: CreateOrderDto;

    beforeEach(() => {
      mockCard = Card.create(validCreateCardDto);
      mockCard.balance = 100; // Reward points balance

      mockClient = Client.create(validCreateClientDto);
      mockClient.clientId = 1;
      mockClient.getCard = jest.fn().mockReturnValue(mockCard);

      mockTariff = new Tariff(
        standardTariff.cardTypeId,
        standardTariff.name,
        standardTariff.code,
        standardTariff.bonus,
        standardTariff.createdDate,
        standardTariff.countryCode,
      );

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
        status: 'Free',
        type: 'BAY',
        errorMessage: null,
      });

      // Mock the tariff check
      tariffRepository.findCardTariff.mockResolvedValue(mockTariff);

      // Mock the order creation

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
      const newOrder = Order.create(orderData);
      newOrder.id = 1;
      orderRepository.create.mockResolvedValue(newOrder);

      // Mock the car wash response
      posService.send.mockResolvedValue({
        sendStatus: SendStatus.SUCCESS,
        errorMessage: '',
      });
    });

    it('should throw BayBusyException when bay is busy', async () => {
      // Arrange Bay is busy
      posService.ping.mockResolvedValue({
        id: 'device-123',
        status: 'Busy',
        type: 'BAY',
        errorMessage: 'Bay is busy',
      });

      // Act & Assert
      await expect(
        createOrderUseCase.execute(createOrderDto, mockClient),
      ).rejects.toThrow(BayBusyException);
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
        type: 'BAY',
        errorMessage: 'Car wash is unavailable',
      });

      // Act & Assert
      await expect(
        createOrderUseCase.execute(createOrderDto, mockClient),
      ).rejects.toThrow(CarwashUnavalibleException);
    });

    it('should create an order successfully without promo code or reward points', async () => {
      // Act
      const result = await createOrderUseCase.execute(
        createOrderDto,
        mockClient,
      );

      // Assert
      expect(tariffRepository.findCardTariff).toHaveBeenCalledWith(mockCard);
      expect(orderRepository.create).toHaveBeenCalled();

      // Instead of checking for updateOrderStatus call that no longer exists
      // Remove: expect(orderRepository.updateOrderStatus).toHaveBeenCalledWith(...);

      // Check the returned object instead
      expect(result).toEqual({
        orderId: 1, // Assuming your mock returns an order with ID 1
        status: OrderStatus.CREATED,
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
    });

    it('should throw InsufficientRewardPointsException when card balance is less than reward points used', async () => {
      // Arrange
      createOrderDto.rewardPointsUsed = 150; // More than card balance (100)

      // Act & Assert
      await expect(
        createOrderUseCase.execute(createOrderDto, mockClient),
      ).rejects.toThrow(InsufficientRewardPointsException);
    });

    it('should throw error when order creation fails', async () => {
      // Arrange
      orderRepository.create.mockResolvedValue(null); // Order creation fails

      // Act & Assert
      await expect(
        createOrderUseCase.execute(createOrderDto, mockClient),
      ).rejects.toThrow('Failed to create order');
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
