import { Test, TestingModule } from '@nestjs/testing';
import { UpdateClientUseCase } from './account-client-update';
import { IClientRepository } from '../../../domain/account/client/client-repository.abstract';
import { Client } from '../../../domain/account/client/model/client';
import { AccountNotFoundExceptions } from '../../../domain/account/exceptions/account-not-found.exceptions';
import { AccountClientUpdateDto } from '../../../domain/dto/account-client-update.dto';
import { AvatarType } from '../../../domain/account/client/enum/avatar.enum';

describe('UpdateClientUseCase', () => {
  let updateClientUseCase: UpdateClientUseCase;
  let clientRepository: jest.Mocked<IClientRepository>;

  beforeEach(async () => {
    const mockClientRepository = {
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateClientUseCase,
        { provide: IClientRepository, useValue: mockClientRepository },
      ],
    }).compile();

    updateClientUseCase = module.get<UpdateClientUseCase>(UpdateClientUseCase);
    clientRepository = module.get(IClientRepository);
  });

  describe('execute', () => {
    let mockClient: Client;

    beforeEach(() => {
      mockClient = new Client();
      mockClient.clientId = 1;
      mockClient.phone = '+79123456789';
      mockClient.correctPhone = '79123456789';
      mockClient.name = 'Original Name';
      mockClient.email = 'original@email.com';
      mockClient.avatarOnvi = AvatarType.ONE;
      mockClient.isNotifications = 1;
      mockClient.isActivated = 1;
    });

    it('should update client name when provided', async () => {
      // Arrange
      const updateDto: AccountClientUpdateDto = {
        name: 'New Name',
      };
      clientRepository.update.mockResolvedValue({
        ...mockClient,
        name: 'New Name',
      });

      // Act
      const result = await updateClientUseCase.execute(updateDto, mockClient);

      // Assert
      expect(mockClient.name).toBe('New Name');
      expect(clientRepository.update).toHaveBeenCalledWith(mockClient);
      expect(result.name).toBe('New Name');
    });

    it('should update client email when provided', async () => {
      // Arrange
      const updateDto: AccountClientUpdateDto = {
        email: 'new@email.com',
      };
      clientRepository.update.mockResolvedValue({
        ...mockClient,
        email: 'new@email.com',
      });

      // Act
      const result = await updateClientUseCase.execute(updateDto, mockClient);

      // Assert
      expect(mockClient.email).toBe('new@email.com');
      expect(clientRepository.update).toHaveBeenCalledWith(mockClient);
      expect(result.email).toBe('new@email.com');
    });

    it('should update client avatar to ONE when avatar=1', async () => {
      // Arrange
      const updateDto: AccountClientUpdateDto = {
        avatar: 1,
      };
      clientRepository.update.mockResolvedValue({
        ...mockClient,
        avatarOnvi: AvatarType.ONE,
      });

      // Act
      const result = await updateClientUseCase.execute(updateDto, mockClient);

      // Assert
      expect(mockClient.avatarOnvi).toBe(AvatarType.ONE);
      expect(clientRepository.update).toHaveBeenCalledWith(mockClient);
      expect(result.avatarOnvi).toBe(AvatarType.ONE);
    });

    it('should update client avatar to TWO when avatar=2', async () => {
      // Arrange
      const updateDto: AccountClientUpdateDto = {
        avatar: 2,
      };
      clientRepository.update.mockResolvedValue({
        ...mockClient,
        avatarOnvi: AvatarType.TWO,
      });

      // Act
      const result = await updateClientUseCase.execute(updateDto, mockClient);

      // Assert
      expect(mockClient.avatarOnvi).toBe(AvatarType.TWO);
      expect(clientRepository.update).toHaveBeenCalledWith(mockClient);
      expect(result.avatarOnvi).toBe(AvatarType.TWO);
    });

    it('should update client avatar to THREE when avatar=3', async () => {
      // Arrange
      const updateDto: AccountClientUpdateDto = {
        avatar: 3,
      };
      clientRepository.update.mockResolvedValue({
        ...mockClient,
        avatarOnvi: AvatarType.THREE,
      });

      // Act
      const result = await updateClientUseCase.execute(updateDto, mockClient);

      // Assert
      expect(mockClient.avatarOnvi).toBe(AvatarType.THREE);
      expect(clientRepository.update).toHaveBeenCalledWith(mockClient);
      expect(result.avatarOnvi).toBe(AvatarType.THREE);
    });

    it('should enable notifications when notification=true', async () => {
      // Arrange
      const updateDto: AccountClientUpdateDto = {
        notification: true,
      };
      clientRepository.update.mockResolvedValue({
        ...mockClient,
        isNotifications: 1,
      });

      // Act
      const result = await updateClientUseCase.execute(updateDto, mockClient);

      // Assert
      expect(mockClient.isNotifications).toBe(1);
      expect(clientRepository.update).toHaveBeenCalledWith(mockClient);
      expect(result.isNotifications).toBe(1);
    });

    it('should disable notifications when notification=false', async () => {
      // Arrange
      const updateDto: AccountClientUpdateDto = {
        notification: false,
      };
      clientRepository.update.mockResolvedValue({
        ...mockClient,
        isNotifications: 0,
      });

      // Act
      const result = await updateClientUseCase.execute(updateDto, mockClient);

      // Assert
      expect(mockClient.isNotifications).toBe(0);
      expect(clientRepository.update).toHaveBeenCalledWith(mockClient);
      expect(result.isNotifications).toBe(0);
    });

    it('should update isActivated when provided', async () => {
      // Arrange
      const updateDto: AccountClientUpdateDto = {
        isActivated: 0,
      };
      clientRepository.update.mockResolvedValue({
        ...mockClient,
        isActivated: 0,
      });

      // Act
      const result = await updateClientUseCase.execute(updateDto, mockClient);

      // Assert
      expect(mockClient.isActivated).toBe(0);
      expect(clientRepository.update).toHaveBeenCalledWith(mockClient);
      expect(result.isActivated).toBe(0);
    });

    it('should update multiple fields when provided', async () => {
      // Arrange
      const updateDto: AccountClientUpdateDto = {
        name: 'New Name',
        email: 'new@email.com',
        avatar: 2,
        notification: false,
        isActivated: 0,
      };
      clientRepository.update.mockResolvedValue({
        ...mockClient,
        name: 'New Name',
        email: 'new@email.com',
        avatarOnvi: AvatarType.TWO,
        isNotifications: 0,
        isActivated: 0,
      });

      // Act
      const result = await updateClientUseCase.execute(updateDto, mockClient);

      // Assert
      expect(mockClient.name).toBe('New Name');
      expect(mockClient.email).toBe('new@email.com');
      expect(mockClient.avatarOnvi).toBe(AvatarType.TWO);
      expect(mockClient.isNotifications).toBe(0);
      expect(mockClient.isActivated).toBe(0);
      expect(clientRepository.update).toHaveBeenCalledWith(mockClient);
      expect(result.name).toBe('New Name');
      expect(result.email).toBe('new@email.com');
      expect(result.avatarOnvi).toBe(AvatarType.TWO);
      expect(result.isNotifications).toBe(0);
      expect(result.isActivated).toBe(0);
    });

    it('should throw AccountNotFoundExceptions when update fails', async () => {
      // Arrange
      const updateDto: AccountClientUpdateDto = {
        name: 'New Name',
      };
      clientRepository.update.mockResolvedValue(null); // Simulating update failure

      // Act & Assert
      await expect(
        updateClientUseCase.execute(updateDto, mockClient),
      ).rejects.toThrow(AccountNotFoundExceptions);
      expect(clientRepository.update).toHaveBeenCalledWith(mockClient);
    });

    it('should not modify fields that are not provided in the update DTO', async () => {
      // Arrange
      const updateDto: AccountClientUpdateDto = {
        name: 'New Name',
      };

      const originalEmail = mockClient.email;
      const originalAvatar = mockClient.avatarOnvi;
      const originalNotifications = mockClient.isNotifications;
      const originalActivation = mockClient.isActivated;

      clientRepository.update.mockResolvedValue({
        ...mockClient,
        name: 'New Name',
      });

      // Act
      await updateClientUseCase.execute(updateDto, mockClient);

      // Assert
      expect(mockClient.name).toBe('New Name'); // Should be updated
      expect(mockClient.email).toBe(originalEmail); // Should remain unchanged
      expect(mockClient.avatarOnvi).toBe(originalAvatar); // Should remain unchanged
      expect(mockClient.isNotifications).toBe(originalNotifications); // Should remain unchanged
      expect(mockClient.isActivated).toBe(originalActivation); // Should remain unchanged
    });
  });
});
