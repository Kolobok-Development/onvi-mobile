import { Test, TestingModule } from '@nestjs/testing';
import { PromotionUsecase } from './promotion.usecase';
import { IPromotionRepository } from '../../../domain/promotion/promotion-repository.abstract';
import { IPromotionHistoryRepository } from '../../../domain/promotion/promotionHistory-repository.abstract';
import { ITransactionRepository } from '../../../domain/transaction/transaction-repository.abstract';
import { ICardRepository } from '../../../domain/account/card/card-repository.abstract';
import { Client } from '../../../domain/account/client/model/client';
import { Card } from '../../../domain/account/card/model/card';
import { Promotion } from '../../../domain/promotion/model/promotion.model';
import { PromotionHist } from '../../../domain/promotion/model/promotionHist';
import { ApplyPromotionDto } from './dto/apply-promotion.dto';
import { PromotionNotFoundException } from '../../../domain/promotion/exceptions/promotion-not-found.exception';
import { InvalidPromotionException } from '../../../domain/promotion/exceptions/invalid-promotion.exception';

describe('PromotionUsecase', () => {
  let promotionUsecase: PromotionUsecase;
  let promotionRepository: jest.Mocked<IPromotionRepository>;
  let promotionHistoryRepository: jest.Mocked<IPromotionHistoryRepository>;
  let transactionRepository: jest.Mocked<ITransactionRepository>;
  let cardRepository: jest.Mocked<ICardRepository>;

  beforeEach(async () => {
    const mockPromotionRepository = {
      findOneByCode: jest.fn(),
      validateUsageByCard: jest.fn(),
      apply: jest.fn(),
      findActive: jest.fn(),
    };

    const mockPromotionHistoryRepository = {
      getPromotionHistory: jest.fn(),
    };

    const mockTransactionRepository = {
      create: jest.fn(),
    };

    const mockCardRepository = {
      changeType: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromotionUsecase,
        { provide: IPromotionRepository, useValue: mockPromotionRepository },
        { provide: IPromotionHistoryRepository, useValue: mockPromotionHistoryRepository },
        { provide: ITransactionRepository, useValue: mockTransactionRepository },
        { provide: ICardRepository, useValue: mockCardRepository },
      ],
    }).compile();

    promotionUsecase = module.get<PromotionUsecase>(PromotionUsecase);
    promotionRepository = module.get(IPromotionRepository);
    promotionHistoryRepository = module.get(IPromotionHistoryRepository);
    transactionRepository = module.get(ITransactionRepository);
    cardRepository = module.get(ICardRepository);

    // Mock the generateUniqueExt method
    jest.spyOn(promotionUsecase, 'generateUniqueExt').mockReturnValue('Promotion_1234567890');
  });

  describe('apply', () => {
    let mockClient: Client;
    let mockCard: Card;
    let mockPromotion: Promotion;
    let applyPromotionDto: ApplyPromotionDto;

    beforeEach(() => {
      mockCard = new Card();
      mockCard.cardId = 123;
      
      mockClient = new Client();
      mockClient.clientId = 1;
      mockClient.getCard = jest.fn().mockReturnValue(mockCard);
      
      mockPromotion = new Promotion();
      mockPromotion.promotionId = 1;
      mockPromotion.code = 'PROMO123';
      mockPromotion.isActive = 1;
      mockPromotion.expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
      mockPromotion.periodUse = 30; // 30 days
      mockPromotion.point = 100;
      
      applyPromotionDto = {
        code: 'PROMO123',
      };
    });

    it('should throw PromotionNotFoundException when promotion does not exist', async () => {
      // Arrange
      promotionRepository.findOneByCode.mockResolvedValue(null);

      // Act & Assert
      await expect(promotionUsecase.apply(applyPromotionDto, mockClient)).rejects.toThrow(
        PromotionNotFoundException,
      );
      expect(promotionRepository.findOneByCode).toHaveBeenCalledWith(applyPromotionDto.code);
    });

    it('should throw InvalidPromotionException when promotion is not active', async () => {
      // Arrange
      mockPromotion.isActive = 0;
      promotionRepository.findOneByCode.mockResolvedValue(mockPromotion);

      // Act & Assert
      await expect(promotionUsecase.apply(applyPromotionDto, mockClient)).rejects.toThrow(
        InvalidPromotionException,
      );
    });

    it('should throw InvalidPromotionException when promotion is expired', async () => {
      // Arrange
      mockPromotion.expiryDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
      promotionRepository.findOneByCode.mockResolvedValue(mockPromotion);

      // Act & Assert
      await expect(promotionUsecase.apply(applyPromotionDto, mockClient)).rejects.toThrow(
        InvalidPromotionException,
      );
    });

    it('should throw InvalidPromotionException when promotion usage is invalid', async () => {
      // Arrange
      promotionRepository.findOneByCode.mockResolvedValue(mockPromotion);
      promotionRepository.validateUsageByCard.mockResolvedValue(false);

      // Act & Assert
      await expect(promotionUsecase.apply(applyPromotionDto, mockClient)).rejects.toThrow(
        InvalidPromotionException,
      );
      expect(promotionRepository.validateUsageByCard).toHaveBeenCalledWith(
        mockCard.cardId,
        mockPromotion.promotionId,
      );
    });

    it('should create a transaction for points promotion (type 1)', async () => {
      // Arrange
      mockPromotion.type = 1;
      promotionRepository.findOneByCode.mockResolvedValue(mockPromotion);
      promotionRepository.validateUsageByCard.mockResolvedValue(true);
      transactionRepository.create.mockResolvedValue(999); // Transaction ID
      promotionRepository.apply.mockResolvedValue(undefined);

      // Act
      const result = await promotionUsecase.apply(applyPromotionDto, mockClient);

      // Assert
      expect(transactionRepository.create).toHaveBeenCalledWith(
        mockClient,
        mockCard,
        mockPromotion.point.toString(),
        'Promotion_1234567890',
      );
      expect(promotionRepository.apply).toHaveBeenCalledWith(
        mockPromotion,
        mockCard,
        expect.any(Date),
        0, // isActive should be 0 for type 1
      );
      expect(result).toEqual(mockPromotion);
    });

    it('should change card type for cashback promotion (type 2)', async () => {
      // Arrange
      mockPromotion.type = 2;
      mockPromotion.cashbackType = 5; // Some cashback type
      promotionRepository.findOneByCode.mockResolvedValue(mockPromotion);
      promotionRepository.validateUsageByCard.mockResolvedValue(true);
      cardRepository.changeType.mockResolvedValue(undefined);
      promotionRepository.apply.mockResolvedValue(undefined);

      // Act
      const result = await promotionUsecase.apply(applyPromotionDto, mockClient);

      // Assert
      expect(cardRepository.changeType).toHaveBeenCalledWith(
        mockCard.cardId,
        mockPromotion.cashbackType,
      );
      expect(promotionRepository.apply).toHaveBeenCalledWith(
        mockPromotion,
        mockCard,
        expect.any(Date),
        1, // isActive should be 1 for type 2
      );
      expect(result).toEqual(mockPromotion);
    });

    it('should calculate correct expiry period date based on promotion.periodUse', async () => {
      // Arrange
      mockPromotion.type = 1;
      mockPromotion.periodUse = 15; // 15 days
      promotionRepository.findOneByCode.mockResolvedValue(mockPromotion);
      promotionRepository.validateUsageByCard.mockResolvedValue(true);
      transactionRepository.create.mockResolvedValue(999);

      // Mock Date.now to return a consistent value
      const nowMock = jest.spyOn(Date, 'now');
      const now = 1609459200000; // 2021-01-01
      nowMock.mockReturnValue(now);

      // Act
      await promotionUsecase.apply(applyPromotionDto, mockClient);

      // Assert
      expect(promotionRepository.apply).toHaveBeenCalledWith(
        mockPromotion,
        mockCard,
        new Date(now + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        0,
      );

      // Restore mock
      nowMock.mockRestore();
    });
  });

  describe('getActivePromotions', () => {
    let mockClient: Client;
    let mockCard: Card;
    let mockPromotions: Promotion[];

    beforeEach(() => {
      mockCard = new Card();
      mockCard.cardId = 123;
      
      mockClient = new Client();
      mockClient.clientId = 1;
      mockClient.getCard = jest.fn().mockReturnValue(mockCard);
      
      mockPromotions = [
        new Promotion(),
        new Promotion(),
      ];
    });

    it('should return active promotions for the client', async () => {
      // Arrange
      promotionRepository.findActive.mockResolvedValue(mockPromotions);

      // Act
      const result = await promotionUsecase.getActivePromotions(mockClient);

      // Assert
      expect(promotionRepository.findActive).toHaveBeenCalledWith(mockCard.cardId);
      expect(result).toEqual(mockPromotions);
    });

    it('should throw PromotionNotFoundException when no active promotions found', async () => {
      // Arrange
      promotionRepository.findActive.mockResolvedValue(null);

      // Act & Assert
      await expect(promotionUsecase.getActivePromotions(mockClient)).rejects.toThrow(
        PromotionNotFoundException,
      );
      expect(promotionRepository.findActive).toHaveBeenCalledWith(mockCard.cardId);
    });
  });

  describe('getPromotionHistory', () => {
    let mockClient: Client;
    let mockCard: Card;
    let mockPromotionHistory: PromotionHist[];

    beforeEach(() => {
      mockCard = new Card();
      mockCard.cardId = 123;
      
      mockClient = new Client();
      mockClient.clientId = 1;
      mockClient.getCard = jest.fn().mockReturnValue(mockCard);
      
      mockPromotionHistory = [
        new PromotionHist(),
        new PromotionHist(),
      ];
    });

    it('should return promotion history for the client', async () => {
      // Arrange
      promotionHistoryRepository.getPromotionHistory.mockResolvedValue(mockPromotionHistory);

      // Act
      const result = await promotionUsecase.getPromotionHistory(mockClient);

      // Assert
      expect(promotionHistoryRepository.getPromotionHistory).toHaveBeenCalledWith(mockCard);
      expect(result).toEqual(mockPromotionHistory);
    });

    it('should return empty array when no promotion history found', async () => {
      // Arrange
      promotionHistoryRepository.getPromotionHistory.mockResolvedValue([]);

      // Act
      const result = await promotionUsecase.getPromotionHistory(mockClient);

      // Assert
      expect(promotionHistoryRepository.getPromotionHistory).toHaveBeenCalledWith(mockCard);
      expect(result).toEqual([]);
    });
  });

  describe('generateUniqueExt', () => {
    it('should generate a unique extension ID with "Promotion" prefix', () => {
      // Restore the original implementation for this test
      jest.spyOn(promotionUsecase, 'generateUniqueExt').mockRestore();
      
      // Mock Date.now to return a consistent value
      const nowMock = jest.spyOn(Date, 'now');
      const now = 1609459200000; // 2021-01-01
      nowMock.mockReturnValue(now);

      // Act
      const result = promotionUsecase.generateUniqueExt();

      // Assert
      expect(result).toBe('Promotion_1609459200000');
      
      // Restore mock
      nowMock.mockRestore();
    });
  });
});