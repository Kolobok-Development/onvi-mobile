import { Test, TestingModule } from '@nestjs/testing';
import { PromocodeUsecase } from './promocode.usecase';
import { IPromoCodeRepository } from '../../../domain/promo-code/promo-code-repository.abstract';
import { Client } from '../../../domain/account/client/model/client';
import { Card } from '../../../domain/account/card/model/card';
import { PromoCode } from '../../../domain/promo-code/model/promo-code.model';

describe('PromocodeUsecase', () => {
  let promocodeUsecase: PromocodeUsecase;
  let promoCodeRepository: jest.Mocked<IPromoCodeRepository>;

  beforeEach(async () => {
    const mockPromoCodeRepository = {
      findByUserAndActive: jest.fn(),
      create: jest.fn(),
      bindClient: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromocodeUsecase,
        { provide: IPromoCodeRepository, useValue: mockPromoCodeRepository },
      ],
    }).compile();

    promocodeUsecase = module.get<PromocodeUsecase>(PromocodeUsecase);
    promoCodeRepository = module.get(IPromoCodeRepository);
  });

  describe('getActivePromotionHistoryForClient', () => {
    let mockClient: Client;
    let mockCard: Card;
    let mockActivePromoCodes: PromoCode[];

    beforeEach(() => {
      mockCard = new Card();
      mockCard.cardId = 123;

      mockClient = new Client();
      mockClient.clientId = 1;
      mockClient.getCard = jest.fn().mockReturnValue(mockCard);

      mockActivePromoCodes = [new PromoCode(), new PromoCode()];
    });

    it('should return active promo codes for the client', async () => {
      // Arrange
      promoCodeRepository.findByUserAndActive.mockResolvedValue(
        mockActivePromoCodes,
      );

      // Act
      const result = await promocodeUsecase.getActivePromotionHistoryForClient(
        mockClient,
      );

      // Assert
      expect(promoCodeRepository.findByUserAndActive).toHaveBeenCalledWith(
        mockCard.cardId,
      );
      expect(result).toEqual(mockActivePromoCodes);
    });

    it('should return empty array when no active promo codes found', async () => {
      // Arrange
      promoCodeRepository.findByUserAndActive.mockResolvedValue([]);

      // Act
      const result = await promocodeUsecase.getActivePromotionHistoryForClient(
        mockClient,
      );

      // Assert
      expect(promoCodeRepository.findByUserAndActive).toHaveBeenCalledWith(
        mockCard.cardId,
      );
      expect(result).toEqual([]);
    });

    it('should handle null response from repository', async () => {
      // Arrange
      promoCodeRepository.findByUserAndActive.mockResolvedValue(null);

      // Act
      const result = await promocodeUsecase.getActivePromotionHistoryForClient(
        mockClient,
      );

      // Assert
      expect(promoCodeRepository.findByUserAndActive).toHaveBeenCalledWith(
        mockCard.cardId,
      );
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    let mockPromoCode: PromoCode;

    beforeEach(() => {
      mockPromoCode = new PromoCode();
      mockPromoCode.code = 'TESTCODE';
      mockPromoCode.isActive = 1;
      mockPromoCode.expiryDate = new Date();
    });

    it('should create a new promo code', async () => {
      // Arrange
      const createdPromoCode = { ...mockPromoCode, id: 1 };
      promoCodeRepository.create.mockResolvedValue(createdPromoCode);

      // Act
      const result = await promocodeUsecase.create(mockPromoCode);

      // Assert
      expect(promoCodeRepository.create).toHaveBeenCalledWith(mockPromoCode);
      expect(result).toEqual(createdPromoCode);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const error = new Error('Failed to create promo code');
      promoCodeRepository.create.mockRejectedValue(error);

      // Act & Assert
      await expect(promocodeUsecase.create(mockPromoCode)).rejects.toThrow(
        error,
      );
      expect(promoCodeRepository.create).toHaveBeenCalledWith(mockPromoCode);
    });
  });

  describe('bindClient', () => {
    let mockClient: Client;
    let mockPromoCode: PromoCode;

    beforeEach(() => {
      mockClient = new Client();
      mockClient.clientId = 1;

      mockPromoCode = new PromoCode();
      mockPromoCode.id = 1;
      mockPromoCode.code = 'TESTCODE';
    });

    it('should bind a promo code to a client', async () => {
      // Arrange
      const bindResult = { success: true };
      promoCodeRepository.bindClient.mockResolvedValue(bindResult);

      // Act
      const result = await promocodeUsecase.bindClient(
        mockPromoCode,
        mockClient,
      );

      // Assert
      expect(promoCodeRepository.bindClient).toHaveBeenCalledWith(
        mockPromoCode,
        mockClient,
      );
      expect(result).toEqual(bindResult);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const error = new Error('Failed to bind promo code to client');
      promoCodeRepository.bindClient.mockRejectedValue(error);

      // Act & Assert
      await expect(
        promocodeUsecase.bindClient(mockPromoCode, mockClient),
      ).rejects.toThrow(error);
      expect(promoCodeRepository.bindClient).toHaveBeenCalledWith(
        mockPromoCode,
        mockClient,
      );
    });
  });
});
