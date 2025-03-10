import { Test, TestingModule } from '@nestjs/testing';
import { OrderUsecase } from './order.usecase';
import { IPromoCodeRepository } from '../../../domain/promo-code/promo-code-repository.abstract';
import { Client } from '../../../domain/account/client/model/client';
import { Card } from '../../../domain/account/card/model/card';
import { PromoCode } from '../../../domain/promo-code/model/promo-code.model';
import { PromoCodeLocation } from '../../../domain/promo-code/model/promo-code-location';
import { VerifyPromoDto } from './dto/verify-promo.dto';
import { PromoCodeNotFoundException } from '../../../domain/promo-code/exceptions/promo-code-not-found.exception';
import { InvalidPromoCodeException } from '../../../domain/promo-code/exceptions/invalid-promo-code.exception';

describe('OrderUsecase', () => {
  let orderUsecase: OrderUsecase;
  let promoCodeRepository: jest.Mocked<IPromoCodeRepository>;

  beforeEach(async () => {
    const mockPromoCodeRepository = {
      findOneByCode: jest.fn(),
      findMaxUsageByCard: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderUsecase,
        { provide: IPromoCodeRepository, useValue: mockPromoCodeRepository },
      ],
    }).compile();

    orderUsecase = module.get<OrderUsecase>(OrderUsecase);
    promoCodeRepository = module.get(IPromoCodeRepository);
  });

  describe('validatePromo', () => {
    let mockClient: Client;
    let mockCard: Card;
    let mockPromoCode: PromoCode;
    let mockPromoCodeLocations: PromoCodeLocation[];
    let verifyPromoDto: VerifyPromoDto;

    beforeEach(() => {
      mockCard = new Card();
      mockCard.cardId = 123;
      
      mockClient = new Client();
      mockClient.clientId = 1;
      mockClient.getCard = jest.fn().mockReturnValue(mockCard);
      
      // Create PromoCodeLocation for the test car wash
      const promoCodeLocation = new PromoCodeLocation();
      promoCodeLocation.carWashId = 456;
      mockPromoCodeLocations = [promoCodeLocation];
      
      // Create PromoCode with the location
      mockPromoCode = new PromoCode();
      mockPromoCode.id = 789;
      mockPromoCode.code = 'TESTCODE';
      mockPromoCode.isActive = 1;
      mockPromoCode.expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
      mockPromoCode.usageAmount = 3;
      mockPromoCode.discountType = 1; // Percentage
      mockPromoCode.discount = 10;
      mockPromoCode.locations = mockPromoCodeLocations;
      
      verifyPromoDto = {
        promoCode: 'TESTCODE',
        carWashId: 456,
      };
    });

    it('should throw PromoCodeNotFoundException when promo code does not exist', async () => {
      // Arrange
      promoCodeRepository.findOneByCode.mockResolvedValue(null);

      // Act & Assert
      await expect(orderUsecase.validatePromo(verifyPromoDto, mockClient)).rejects.toThrow(
        PromoCodeNotFoundException,
      );
      expect(promoCodeRepository.findOneByCode).toHaveBeenCalledWith('TESTCODE');
    });

    it('should throw InvalidPromoCodeException when promo code is not active', async () => {
      // Arrange
      mockPromoCode.isActive = 0;
      promoCodeRepository.findOneByCode.mockResolvedValue(mockPromoCode);

      // Act & Assert
      await expect(orderUsecase.validatePromo(verifyPromoDto, mockClient)).rejects.toThrow(
        InvalidPromoCodeException,
      );
    });

    it('should throw InvalidPromoCodeException when promo code is expired', async () => {
      // Arrange
      mockPromoCode.expiryDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
      promoCodeRepository.findOneByCode.mockResolvedValue(mockPromoCode);

      // Act & Assert
      await expect(orderUsecase.validatePromo(verifyPromoDto, mockClient)).rejects.toThrow(
        InvalidPromoCodeException,
      );
    });

    it('should throw InvalidPromoCodeException when usage limit is reached', async () => {
      // Arrange
      promoCodeRepository.findOneByCode.mockResolvedValue(mockPromoCode);
      promoCodeRepository.findMaxUsageByCard.mockResolvedValue({ usage: 3 }); // Max usage reached

      // Act & Assert
      await expect(orderUsecase.validatePromo(verifyPromoDto, mockClient)).rejects.toThrow(
        InvalidPromoCodeException,
      );
      expect(promoCodeRepository.findMaxUsageByCard).toHaveBeenCalledWith(
        mockCard.cardId,
        mockPromoCode.id,
      );
    });

    it('should throw InvalidPromoCodeException when location is not allowed', async () => {
      // Arrange
      promoCodeRepository.findOneByCode.mockResolvedValue(mockPromoCode);
      promoCodeRepository.findMaxUsageByCard.mockResolvedValue({ usage: 1 }); // Still has usage left
      
      // Different car wash ID in the request
      verifyPromoDto.carWashId = 999;

      // Act & Assert
      await expect(orderUsecase.validatePromo(verifyPromoDto, mockClient)).rejects.toThrow(
        InvalidPromoCodeException,
      );
    });

    it('should return valid promo verification response when promo code is valid', async () => {
      // Arrange
      promoCodeRepository.findOneByCode.mockResolvedValue(mockPromoCode);
      promoCodeRepository.findMaxUsageByCard.mockResolvedValue({ usage: 1 }); // Still has usage left

      // Act
      const result = await orderUsecase.validatePromo(verifyPromoDto, mockClient);

      // Assert
      expect(result).toEqual({
        valid: true,
        id: mockPromoCode.id,
        type: mockPromoCode.discountType,
        discount: mockPromoCode.discount,
      });
    });

    it('should return valid response when there is no previous usage of the promo code', async () => {
      // Arrange
      promoCodeRepository.findOneByCode.mockResolvedValue(mockPromoCode);
      promoCodeRepository.findMaxUsageByCard.mockResolvedValue(null); // No previous usage

      // Act
      const result = await orderUsecase.validatePromo(verifyPromoDto, mockClient);

      // Assert
      expect(result).toEqual({
        valid: true,
        id: mockPromoCode.id,
        type: mockPromoCode.discountType,
        discount: mockPromoCode.discount,
      });
    });

    it('should trim whitespace from promo code input', async () => {
      // Arrange
      verifyPromoDto.promoCode = ' TEST CODE '; // With whitespace
      promoCodeRepository.findOneByCode.mockResolvedValue(mockPromoCode);
      promoCodeRepository.findMaxUsageByCard.mockResolvedValue(null);

      // Act
      await orderUsecase.validatePromo(verifyPromoDto, mockClient);

      // Assert
      expect(promoCodeRepository.findOneByCode).toHaveBeenCalledWith('TESTCODE');
    });
  });
});