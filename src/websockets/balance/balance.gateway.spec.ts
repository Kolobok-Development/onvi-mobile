import { Test, TestingModule } from '@nestjs/testing';
import { BalanceGateway } from './balance.gateway';
import { Logger } from 'nestjs-pino';
import { Socket } from 'socket.io';

describe('BalanceGateway', () => {
  let gateway: BalanceGateway;

  const mockLogger = {
    log: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  };

  const mockSocket = {
    id: 'test-socket-id',
  } as Socket;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalanceGateway,
        {
          provide: Logger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    gateway = module.get<BalanceGateway>(BalanceGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should respond with pong when receiving ping', () => {
    const response = gateway.handlePing(mockSocket, {});
    expect(response).toEqual({
      event: 'pong',
      data: 'pong',
    });
    expect(mockLogger.log).toHaveBeenCalledWith(
      `Ping received from client id: ${mockSocket.id}`,
    );
  });

  it('should handle request_balance and return balance data', async () => {
    // Setup card service mock
    const cardServiceMock = {
      getCardBalance: jest.fn().mockResolvedValue({
        unqNumber: 'test-card',
        balance: 100,
        onviBonusSum: 50,
        promoCodeSum: 10,
      }),
    };

    // Setup client
    const mockClient = {
      clientId: 1,
      getCard: jest.fn().mockReturnValue({
        unqNumber: 'test-card',
      }),
    };

    // Setup socket with authenticated user
    const mockSocketWithAuth = {
      ...mockSocket,
      handshake: {
        user: mockClient,
      },
    };

    // Replace the cardService with our mock
    Object.defineProperty(gateway, 'cardService', { value: cardServiceMock });

    // Test the handler
    const response = await gateway.handleMessage(
      mockSocketWithAuth as unknown as Socket,
      {},
    );

    expect(mockClient.getCard).toHaveBeenCalled();
    expect(cardServiceMock.getCardBalance).toHaveBeenCalledWith('test-card');
    expect(response).toEqual({
      event: 'balance_update',
      data: {
        unqNumber: 'test-card',
        balance: 100,
        onviBonusSum: 50,
        promoCodeSum: 10,
      },
    });
  });
});
