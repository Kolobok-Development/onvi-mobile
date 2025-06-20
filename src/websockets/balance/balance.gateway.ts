import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger } from 'nestjs-pino';
import { Inject, UseFilters, UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '../../infrastructure/common/guards/jws-ws.guard';
import { WebsocketExceptionsFilter } from '../../infrastructure/common/filters/websocket-exception.filter';
import { CardService } from '../../application/services/card-service';
import { Client } from '../../domain/account/client/model/client';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  transports: ['websocket'],
})
@UseFilters(WebsocketExceptionsFilter)
export class BalanceGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(Logger) private readonly logger: Logger,
    private readonly cardService: CardService,
  ) { }

  @WebSocketServer()
  server: Server;

  // Map to store connections by socket ID
  private connectedClients = new Map<
    string,
    { socket: Socket; userId: string; cardNumber?: string }
  >();

  // Map to store socket IDs by card number for quick lookup
  private cardToSocketMap = new Map<string, string[]>();

  afterInit() {
    this.logger.log('Initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    const { sockets } = this.server.sockets;
    this.logger.log(`Client id: ${client.id} connected`);
    this.logger.debug(`Number of connected clients: ${sockets.size}`);

    // Store the connection initially without user data
    this.connectedClients.set(client.id, {
      socket: client,
      userId: null,
    });

    // Try to authenticate on connection if token is provided in handshake
    const user = (client?.handshake as any)?.user as Client;
    if (user) {
      this.associateUserWithSocket(client, user);
    } else {
      this.logger.log(`No authenticated user found in handshake for client ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client id: ${client.id} disconnected`);

    // Get client data before removing
    const clientData = this.connectedClients.get(client.id);

    // Remove from connectedClients map
    this.connectedClients.delete(client.id);

    // Remove from cardToSocketMap if client had card number
    if (clientData?.cardNumber) {
      const socketsForCard =
        this.cardToSocketMap.get(clientData.cardNumber) || [];
      const updatedSockets = socketsForCard.filter((id) => id !== client.id);

      if (updatedSockets.length > 0) {
        this.cardToSocketMap.set(clientData.cardNumber, updatedSockets);
      } else {
        this.cardToSocketMap.delete(clientData.cardNumber);
      }
    }
  }

  /**
   * Associate a user with a socket connection and map their card number
   */
  private associateUserWithSocket(socket: Socket, user: Client): void {
    try {
      const card = user.getCard();
      if (!card) {
        this.logger.warn(
          `User ${user.clientId} has no card, cannot map to socket`,
        );
        return;
      }

      const cardNumber = card.devNomer;
      const userId = user.clientId.toString();

      // Update client connection data
      this.connectedClients.set(socket.id, {
        socket,
        userId,
        cardNumber,
      });

      // Update cardToSocketMap for quick lookups
      const existingSockets = this.cardToSocketMap.get(cardNumber) || [];
      if (!existingSockets.includes(socket.id)) {
        existingSockets.push(socket.id);
        this.cardToSocketMap.set(cardNumber, existingSockets);
      }

      this.logger.log(
        `Associated socket ${socket.id} with user ${userId} and card ${cardNumber}`,
      );
    } catch (error) {
      this.logger.error(`Error associating user with socket: ${error.message}`);
    }
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('request_balance')
  async handleMessage(client: Socket, data: any): Promise<WsResponse<any>> {
    this.logger.log(`Received request_balance from ${client.id}`);

    try {
      // Защита на случай отсутствия пользователя в handshake
      const authenticatedClient = (client?.handshake as any)?.user as Client | undefined;

      if (!authenticatedClient) {
        this.logger.log(`No user found in request for socket ${client.id}`);
        return {
          event: 'balance_update',
          data: { error: 'Unauthorized' },
        };
      }

      this.associateUserWithSocket(client, authenticatedClient);

      const card = authenticatedClient.getCard();

      if (!card) {
        this.logger.log(`No card found for client ${authenticatedClient.clientId}`);
        return {
          event: 'balance_update',
          data: { error: 'No card found' },
        };
      }

      const balanceInfo = await this.cardService.getCardBalance(card.devNomer);

      return {
        event: 'balance_update',
        data: balanceInfo,
      };
    } catch (error) {
      this.logger.log(`Error fetching balance: ${error?.message ?? error}`);

      // Возвращаем понятный ответ, чтобы не падал фильтр исключений
      return {
        event: 'balance_update',
        data: { error: 'Failed to fetch balance' },
      };
    }
  }

  // @UseGuards(WsAuthGuard)
  // @SubscribeMessage('request_balance')
  // async handleMessage(client: Socket, data: any): Promise<WsResponse<any>> {
  //   this.logger.log(`Received request_balance from ${client.id}`);

  //   try {
  //     // Get the authenticated client from the handshake
  //     const authenticatedClient = (client?.handshake as any)?.user as Client;

  //     if (!authenticatedClient) {
  //       this.logger.error(`No user found in request for socket ${client.id}`);
  //       return {
  //         event: 'balance_update',
  //         data: { error: 'Unauthorized' },
  //       };
  //     }

  //     // Associate user with socket for future updates
  //     this.associateUserWithSocket(client, authenticatedClient);

  //     // Get the card from client
  //     const card = authenticatedClient.getCard();

  //     if (!card) {
  //       this.logger.error(
  //         `No card found for client ${authenticatedClient.clientId}`,
  //       );
  //       return {
  //         event: 'balance_update',
  //         data: { error: 'No card found' },
  //       };
  //     }

  //     // Get balance information
  //     const balanceInfo = await this.cardService.getCardBalance(card.devNomer);

  //     return {
  //       event: 'balance_update',
  //       data: balanceInfo,
  //     };
  //   } catch (error) {
  //     this.logger.error(`Error fetching balance: ${error.message}`);
  //     return {
  //       event: 'balance_update',
  //       data: { error: 'Failed to fetch balance' },
  //     };
  //   }
  // }

  @SubscribeMessage('ping')
  handlePing(client: Socket, payload: any): WsResponse<string> {
    this.logger.log(`Ping received from client id: ${client.id}`);
    this.logger.debug(`Payload: ${payload}`);
    return {
      event: 'pong',
      data: 'pong',
    };
  }

  /**
   * Broadcast balance update to all connected clients with the specified card
   */
  public async broadcastBalanceUpdate(cardNumber: string): Promise<void> {
    this.logger.log(`Broadcasting balance update for card: ${cardNumber}`);

    // Get socketIds for this card
    const socketIds = this.cardToSocketMap.get(cardNumber) || [];

    if (socketIds.length === 0) {
      this.logger.debug(`No connected clients found for card: ${cardNumber}`);
      return;
    }

    try {
      // Get updated balance information
      const balanceInfo = await this.cardService.getCardBalance(cardNumber);

      if (!balanceInfo) {
        this.logger.error(`Failed to get balance info for card: ${cardNumber}`);
        return;
      }

      // Broadcast to all connected sockets for this card
      for (const socketId of socketIds) {
        const clientData = this.connectedClients.get(socketId);

        if (clientData && clientData.socket.connected) {
          this.logger.debug(`Emitting balance update to socket: ${socketId}`);

          clientData.socket.emit('balance_update', balanceInfo);
        } else {
          // Clean up stale connections
          this.logger.debug(
            `Socket ${socketId} no longer connected, cleaning up`,
          );
          this.connectedClients.delete(socketId);

          // Update the card-to-socket map
          const updatedSocketIds = socketIds.filter((id) => id !== socketId);
          if (updatedSocketIds.length > 0) {
            this.cardToSocketMap.set(cardNumber, updatedSocketIds);
          } else {
            this.cardToSocketMap.delete(cardNumber);
          }
        }
      }

      this.logger.log(
        `Successfully broadcasted balance update to ${socketIds.length} clients for card: ${cardNumber}`,
      );
    } catch (error) {
      this.logger.error(`Error broadcasting balance update: ${error.message}`);
    }
  }
}

