import { Test, TestingModule } from '@nestjs/testing';
import { DeleteAccountUseCase } from './account-delete';
import { UpdateClientUseCase } from './account-client-update';
import { ICardRepository } from '../../../domain/account/card/card-repository.abstract';
import { Client } from '../../../domain/account/client/model/client';
import { Card } from '../../../domain/account/card/model/card';
import { AccountNotFoundExceptions } from '../../../domain/account/exceptions/account-not-found.exceptions';

describe('DeleteAccountUseCase', () => {
  let deleteAccountUseCase: DeleteAccountUseCase;
  let updateClientUseCase: jest.Mocked<UpdateClientUseCase>;
  let cardRepository: jest.Mocked<ICardRepository>;

  beforeEach(async () => {
    const mockUpdateClientUseCase = {
      execute: jest.fn(),
    };

    const mockCardRepository = {
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteAccountUseCase,
        { provide: UpdateClientUseCase, useValue: mockUpdateClientUseCase },
        { provide: ICardRepository, useValue: mockCardRepository },
      ],
    }).compile();

    deleteAccountUseCase =
      module.get<DeleteAccountUseCase>(DeleteAccountUseCase);
    updateClientUseCase = module.get(UpdateClientUseCase);
    cardRepository = module.get(ICardRepository);
  });

  describe('execute', () => {
    let mockClient: Client;
    let mockCard: Card;

    beforeEach(() => {
      mockCard = new Card();
      mockCard.cardId = 123;

      mockClient = {
        clientId: 1,
        phone: '+79123456789',
        correctPhone: '79123456789',
        isActivated: 1,
        getCard = jest.fn().mockReturnValue(mockCard),
      } as unknown as Client;


    it('should successfully deactivate the account', async () => {
      // Arrange
      updateClientUseCase.execute.mockResolvedValue(mockClient);
      cardRepository.delete.mockResolvedValue(true);

      // Act
      const result = await deleteAccountUseCase.execute(mockClient);

      // Assert
      expect(updateClientUseCase.execute).toHaveBeenCalledWith(
        { isActivated: 0 },
        mockClient,
      );
      expect(cardRepository.delete).toHaveBeenCalledWith(mockCard.cardId);
      expect(result).toEqual({ message: 'Success' });
    });

    it('should throw AccountNotFoundExceptions when card deletion fails', async () => {
      // Arrange
      updateClientUseCase.execute.mockResolvedValue(mockClient);
      cardRepository.delete.mockResolvedValue(false); // Simulating deletion failure

      // Act & Assert
      await expect(deleteAccountUseCase.execute(mockClient)).rejects.toThrow(
        AccountNotFoundExceptions,
      );
      expect(updateClientUseCase.execute).toHaveBeenCalledWith(
        { isActivated: 0 },
        mockClient,
      );
      expect(cardRepository.delete).toHaveBeenCalledWith(mockCard.cardId);
    });

    it('should throw error when client update fails', async () => {
      // Arrange
      const error = new Error('Update failed');
      updateClientUseCase.execute.mockRejectedValue(error);

      // Act & Assert
      await expect(deleteAccountUseCase.execute(mockClient)).rejects.toThrow(
        error,
      );
      expect(updateClientUseCase.execute).toHaveBeenCalledWith(
        { isActivated: 0 },
        mockClient,
      );
      expect(cardRepository.delete).not.toHaveBeenCalled(); // Should not reach this step
    });

    it('should call getCard on the client object to get the card ID', async () => {
      // Arrange
      updateClientUseCase.execute.mockResolvedValue(mockClient);
      cardRepository.delete.mockResolvedValue(true);

      // Act
      await deleteAccountUseCase.execute(mockClient);

      // Assert
      expect(mockClient.getCard).toHaveBeenCalled();
      expect(cardRepository.delete).toHaveBeenCalledWith(mockCard.cardId);
    });
  });
});
