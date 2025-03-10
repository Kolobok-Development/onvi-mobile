import { Test, TestingModule } from '@nestjs/testing';
import { AuthUsecase } from './auth.usecase';
import { IClientRepository } from '../../../domain/account/client/client-repository.abstract';
import { ICardRepository } from '../../../domain/account/card/card-repository.abstract';
import { IJwtService } from '../../../domain/auth/adapters/jwt.interface';
import { IOtpRepository } from '../../../domain/otp/adapter/otp-repository.interface';
import { IDate } from '../../../infrastructure/common/interfaces/date.interface';
import { IJwtConfig } from '../../../domain/config/jwt-config.interface';
import { IBcrypt } from '../../../domain/auth/adapters/bcrypt.interface';
import { Client } from '../../../domain/account/client/model/client';
import { Card } from '../../../domain/account/card/model/card';
import { Otp } from '../../../domain/otp/model/otp';
import { InvalidOtpException } from '../../../domain/auth/exceptions/invalid-otp.exception';
import { AccountExistsException } from '../../../domain/account/exceptions/account-exists.exception';
import { InvalidRefreshException } from '../../../domain/auth/exceptions/invalid-refresh.exception';
import { ClientType } from '../../../domain/account/client/enum/clinet-type.enum';
import { CardType } from '../../../domain/account/card/enum/card-type.enum';
import { AccountNotFoundExceptions } from '../../../domain/account/exceptions/account-not-found.exceptions';
import { InvalidAccessException } from '../../../domain/auth/exceptions/invalida-token.excpetion';

describe('AuthUsecase', () => {
  let authUsecase: AuthUsecase;
  let clientRepository: jest.Mocked<IClientRepository>;
  let cardRepository: jest.Mocked<ICardRepository>;
  let jwtService: jest.Mocked<IJwtService>;
  let otpRepository: jest.Mocked<IOtpRepository>;
  let dateService: jest.Mocked<IDate>;
  let jwtConfig: jest.Mocked<IJwtConfig>;
  let bcryptService: jest.Mocked<IBcrypt>;

  beforeEach(async () => {
    const mockClientRepository = {
      findOneByPhone: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      setRefreshToken: jest.fn(),
    };

    const mockCardRepository = {
      create: jest.fn(),
      reActivate: jest.fn(),
      findOneByDevNomer: jest.fn(),
    };

    const mockJwtService = {
      signToken: jest.fn(),
      verifyToken: jest.fn(),
    };

    const mockOtpRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      removeOne: jest.fn(),
      send: jest.fn(),
    };

    const mockDateService = {
      isExpired: jest.fn(),
      generateOtpTime: jest.fn(),
    };

    const mockJwtConfig = {
      getJwtSecret: jest.fn(),
      getJwtExpirationTime: jest.fn(),
      getJwtRefreshSecret: jest.fn(),
      getJwtRefreshExpirationTime: jest.fn(),
    };

    const mockBcryptService = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthUsecase,
        { provide: IClientRepository, useValue: mockClientRepository },
        { provide: ICardRepository, useValue: mockCardRepository },
        { provide: IJwtService, useValue: mockJwtService },
        { provide: IOtpRepository, useValue: mockOtpRepository },
        { provide: IDate, useValue: mockDateService },
        { provide: IJwtConfig, useValue: mockJwtConfig },
        { provide: IBcrypt, useValue: mockBcryptService },
      ],
    }).compile();

    authUsecase = module.get<AuthUsecase>(AuthUsecase);
    clientRepository = module.get(IClientRepository);
    cardRepository = module.get(ICardRepository);
    jwtService = module.get(IJwtService);
    otpRepository = module.get(IOtpRepository);
    dateService = module.get(IDate);
    jwtConfig = module.get(IJwtConfig);
    bcryptService = module.get(IBcrypt);
  });

  describe('register', () => {
    const phone = '+79123456789';
    const otp = '1234';
    const mockOtpData = new Otp(1, phone, otp, new Date());
    const mockAccessToken = {
      token: 'access-token',
      expirationDate: new Date().toISOString(),
    };
    const mockRefreshToken = {
      token: 'refresh-token',
      expirationDate: new Date().toISOString(),
    };

    beforeEach(() => {
      // Common setup for register tests
      jwtService.signToken.mockImplementation((payload, secret, expiresIn) => {
        return 'token';
      });

      jwtConfig.getJwtSecret.mockReturnValue('jwt-secret');
      jwtConfig.getJwtExpirationTime.mockReturnValue('1h');
      jwtConfig.getJwtRefreshSecret.mockReturnValue('refresh-secret');
      jwtConfig.getJwtRefreshExpirationTime.mockReturnValue('7d');

      // Mock for signAccessToken and signRefreshToken
      jest
        .spyOn(authUsecase, 'signAccessToken')
        .mockResolvedValue(mockAccessToken);
      jest
        .spyOn(authUsecase, 'signRefreshToken')
        .mockResolvedValue(mockRefreshToken);
      jest
        .spyOn(authUsecase, 'setCurrentRefreshToken')
        .mockResolvedValue(undefined);

      // Mock generateNomerCard
      jest
        .spyOn(authUsecase as any, 'generateNomerCard')
        .mockResolvedValue('123456789012');
    });

    it('should throw InvalidOtpException when OTP is invalid', async () => {
      // Arrange
      otpRepository.findOne.mockResolvedValue(mockOtpData);
      dateService.isExpired.mockReturnValue(true); // OTP is expired

      // Act & Assert
      await expect(authUsecase.register(phone, otp)).rejects.toThrow(
        InvalidOtpException,
      );
    });

    it('should throw AccountExistsException when user exists and is active', async () => {
      // Arrange
      // Create a mock Card
      const mockCard = {
        isDel: 0,
        isCardActive: jest.fn().mockReturnValue(true),
        cardId: 1,
      } as unknown as Card;

      // Create a mock Client with required methods
      const mockClient = {
        isActivated: 1,
        getCard: jest.fn().mockReturnValue(mockCard),
        isClientActive: jest.fn().mockReturnValue(true),
        phone,
      } as unknown as Client;

      otpRepository.findOne.mockResolvedValue(mockOtpData);
      dateService.isExpired.mockReturnValue(false); // OTP is not expired
      clientRepository.findOneByPhone.mockResolvedValue(mockClient);

      // Act & Assert
      await expect(authUsecase.register(phone, otp)).rejects.toThrow(
        AccountExistsException,
      );
    });

    it('should reactivate a deleted user', async () => {
      // Arrange
      // Create a mock Card that can be modified in the test
      const mockCard = {
        isDel: 1,
        cardId: 1,
        isCardActive: jest.fn().mockReturnValue(false),
      } as unknown as Card;

      // Create a mock Client with required methods
      const mockClient = {
        isActivated: 0,
        phone,
        getCard: jest.fn().mockReturnValue(mockCard),
        isClientActive: jest.fn().mockReturnValue(false),
        refreshToken: undefined,
      } as unknown as Client;

      otpRepository.findOne.mockResolvedValue(mockOtpData);
      dateService.isExpired.mockReturnValue(false); // OTP is not expired
      clientRepository.findOneByPhone.mockResolvedValue(mockClient);
      clientRepository.update.mockResolvedValue(mockClient);
      cardRepository.reActivate.mockResolvedValue(true);

      // Act
      const result = await authUsecase.register(phone, otp);

      // Assert
      expect(clientRepository.update).toHaveBeenCalled();
      expect(cardRepository.reActivate).toHaveBeenCalledWith(mockCard.cardId);
      expect(result.accessToken).toEqual(mockAccessToken);
      expect(result.refreshToken).toEqual(mockRefreshToken);
      expect(result.registeredAccount).toEqual(mockClient);
      expect(mockClient.isActivated).toBe(1);
      expect(mockCard.isDel).toBe(0);
      expect(mockClient.refreshToken).toBe(mockRefreshToken.token);
    });

    it('should create a new user when user does not exist', async () => {
      // Arrange
      otpRepository.findOne.mockResolvedValue(mockOtpData);
      dateService.isExpired.mockReturnValue(false); // OTP is not expired
      clientRepository.findOneByPhone.mockResolvedValue(null); // No existing user

      // Create a mock Card
      const mockNewCard = {
        cardId: 1,
        nomer: '123456789012',
        devNomer: '123456789012',
        dateBegin: new Date(),
        cardTypeId: CardType.ONVI,
      } as unknown as Card;

      // Create a mock Client with required methods
      const mockNewClient = {
        clientId: 1,
        phone,
        addCard: jest.fn(),
      } as unknown as Client;

      clientRepository.create.mockResolvedValue(mockNewClient);
      cardRepository.create.mockResolvedValue(mockNewCard);

      // Mock the card number generation
      cardRepository.findOneByDevNomer.mockResolvedValue(null);
      jest
        .spyOn(authUsecase as any, 'generateRandom12DigitNumber')
        .mockReturnValue('123456789012');

      // Act
      const result = await authUsecase.register(phone, otp);

      // Assert
      expect(clientRepository.create).toHaveBeenCalled();
      expect(cardRepository.create).toHaveBeenCalled();
      expect(authUsecase.setCurrentRefreshToken).toHaveBeenCalledWith(
        phone,
        mockRefreshToken.token,
      );
      expect(result.accessToken).toEqual(mockAccessToken);
      expect(result.refreshToken).toEqual(mockRefreshToken);
      expect(result.newClient).toEqual(mockNewClient);
      expect(mockNewClient.addCard).toHaveBeenCalledWith(mockNewCard);
    });
  });

  describe('validateUserForLocalStrategy', () => {
    const phone = '+79123456789';
    const otp = '1234';
    const mockOtpData = new Otp(1, phone, otp, new Date());

    it('should throw InvalidOtpException when OTP is invalid', async () => {
      // Arrange
      otpRepository.findOne.mockResolvedValue(mockOtpData);
      dateService.isExpired.mockReturnValue(true); // OTP is expired

      // Act & Assert
      await expect(
        authUsecase.validateUserForLocalStrategy(phone, otp),
      ).rejects.toThrow(InvalidOtpException);
    });

    it('should return null when account does not exist', async () => {
      // Arrange
      otpRepository.findOne.mockResolvedValue(mockOtpData);
      dateService.isExpired.mockReturnValue(false); // OTP is not expired
      clientRepository.findOneByPhone.mockResolvedValue(null); // No existing user

      // Act
      const result = await authUsecase.validateUserForLocalStrategy(phone, otp);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when account is not active', async () => {
      // Arrange
      // Create a mock Card
      const mockCard = {
        isDel: 1,
        isCardActive: jest.fn().mockReturnValue(false),
      } as unknown as Card;

      // Create a mock Client
      const mockClient = {
        isActivated: 0,
        getCard: jest.fn().mockReturnValue(mockCard),
        isClientActive: jest.fn().mockReturnValue(false),
      } as unknown as Client;

      otpRepository.findOne.mockResolvedValue(mockOtpData);
      dateService.isExpired.mockReturnValue(false); // OTP is not expired
      clientRepository.findOneByPhone.mockResolvedValue(mockClient);

      // Act
      const result = await authUsecase.validateUserForLocalStrategy(phone, otp);

      // Assert
      expect(result).toBeNull();
    });

    it('should return account when OTP is valid and account is active', async () => {
      // Arrange
      // Create a mock Card
      const mockCard = {
        isDel: 0,
        isCardActive: jest.fn().mockReturnValue(true),
      } as unknown as Card;

      // Create a mock Client
      const mockClient = {
        isActivated: 1,
        getCard: jest.fn().mockReturnValue(mockCard),
        isClientActive: jest.fn().mockReturnValue(true),
      } as unknown as Client;

      otpRepository.findOne.mockResolvedValue(mockOtpData);
      dateService.isExpired.mockReturnValue(false); // OTP is not expired
      clientRepository.findOneByPhone.mockResolvedValue(mockClient);

      // Act
      const result = await authUsecase.validateUserForLocalStrategy(phone, otp);

      // Assert
      expect(result).toEqual(mockClient);
    });
  });

  describe('validateUserForJwtStrategy', () => {
    const phone = '+79123456789';

    it('should throw InvalidAccessException when account does not exist', async () => {
      // Arrange
      clientRepository.findOneByPhone.mockResolvedValue(null);

      // Act & Assert
      await expect(
        authUsecase.validateUserForJwtStrategy(phone),
      ).rejects.toThrow(InvalidAccessException);
    });

    it('should return account when account exists', async () => {
      // Arrange
      // Create a mock Client
      const mockClient = {
        clientId: 1,
        phone,
      } as unknown as Client;

      clientRepository.findOneByPhone.mockResolvedValue(mockClient);

      // Act
      const result = await authUsecase.validateUserForJwtStrategy(phone);

      // Assert
      expect(result).toEqual(mockClient);
    });
  });

  describe('signAccessToken and signRefreshToken', () => {
    const phone = '+79123456789';

    it('should sign access token with correct parameters', async () => {
      // Arrange
      const secret = 'jwt-secret';
      const expiresIn = '1h';
      jwtConfig.getJwtSecret.mockReturnValue(secret);
      jwtConfig.getJwtExpirationTime.mockReturnValue(expiresIn);
      jwtService.signToken.mockReturnValue('access-token');

      // Act
      const result = await authUsecase.signAccessToken(phone);

      // Assert
      expect(jwtService.signToken).toHaveBeenCalledWith(
        { phone },
        secret,
        expiresIn,
      );
      expect(result.token).toEqual('access-token');
      expect(result.expirationDate).toBeDefined();
    });

    it('should sign refresh token with correct parameters', async () => {
      // Arrange
      const secret = 'refresh-secret';
      const expiresIn = '7d';
      jwtConfig.getJwtRefreshSecret.mockReturnValue(secret);
      jwtConfig.getJwtRefreshExpirationTime.mockReturnValue(expiresIn);
      jwtService.signToken.mockReturnValue('refresh-token');

      // Act
      const result = await authUsecase.signRefreshToken(phone);

      // Assert
      expect(jwtService.signToken).toHaveBeenCalledWith(
        { phone },
        secret,
        expiresIn,
      );
      expect(result.token).toEqual('refresh-token');
      expect(result.expirationDate).toBeDefined();
    });
  });

  describe('getAccountIfRefreshTokenMatches', () => {
    const phone = '+79123456789';
    const refreshToken = 'refresh-token';

    it('should return null when account does not exist', async () => {
      // Arrange
      clientRepository.findOneByPhone.mockResolvedValue(null);

      // Act
      const result = await authUsecase.getAccountIfRefreshTokenMatches(
        refreshToken,
        phone,
      );

      // Assert
      expect(result).toBeNull();
    });

    it('should throw InvalidRefreshException when refresh tokens do not match', async () => {
      // Arrange
      // Create a mock Client
      const mockClient = {
        clientId: 1,
        phone,
        refreshToken: 'different-token',
      } as unknown as Client;

      clientRepository.findOneByPhone.mockResolvedValue(mockClient);

      // Act & Assert
      await expect(
        authUsecase.getAccountIfRefreshTokenMatches(refreshToken, phone),
      ).rejects.toThrow(InvalidRefreshException);
    });

    it('should return account when refresh tokens match', async () => {
      // Arrange
      // Create a mock Client
      const mockClient = {
        clientId: 1,
        phone,
        refreshToken: refreshToken,
      } as unknown as Client;

      clientRepository.findOneByPhone.mockResolvedValue(mockClient);

      // Act
      const result = await authUsecase.getAccountIfRefreshTokenMatches(
        refreshToken,
        phone,
      );

      // Assert
      expect(result).toEqual(mockClient);
    });
  });

  describe('sendOtp', () => {
    const phone = '+79123456789';
    const mockOtpTime = new Date();

    beforeEach(() => {
      dateService.generateOtpTime.mockReturnValue(mockOtpTime);
      jest.spyOn(authUsecase as any, 'generateOtp').mockReturnValue('1234');
    });

    it('should create and send a new OTP', async () => {
      // Arrange
      // Use an actual Otp instance since it's a simple data class
      const mockOtp = new Otp(1, phone, '1234', mockOtpTime);
      otpRepository.create.mockResolvedValue(mockOtp);
      otpRepository.removeOne.mockResolvedValue(undefined);
      otpRepository.send.mockResolvedValue(undefined);

      // Act
      const result = await authUsecase.sendOtp(phone);

      // Assert
      expect(otpRepository.removeOne).toHaveBeenCalledWith(phone);
      expect(otpRepository.create).toHaveBeenCalled();
      expect(otpRepository.send).toHaveBeenCalledWith(mockOtp);
      expect(result).toEqual(mockOtp);
    });

    it('should use 0000 as OTP for test phone number', async () => {
      // Arrange
      const testPhone = '+79999999999';
      const mockOtp = new Otp(1, testPhone, '0000', mockOtpTime);
      otpRepository.create.mockResolvedValue(mockOtp);
      otpRepository.removeOne.mockResolvedValue(undefined);
      otpRepository.send.mockResolvedValue(undefined);

      // Act
      const result = await authUsecase.sendOtp(testPhone);

      // Assert
      expect(result.otp).toEqual('0000');
    });
  });
});
