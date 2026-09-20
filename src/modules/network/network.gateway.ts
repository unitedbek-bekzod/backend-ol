import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { NetworkService } from './network.service.js';
import type { JwtPayload } from '../../common/types/jwt-payload.type.js';

interface AuthenticatedSocket extends Socket {
  data: { user?: JwtPayload };
}

@WebSocketGateway({ namespace: 'network', cors: { origin: 'http://localhost:5173', credentials: true } })
export class NetworkGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger('NetworkGateway');

  constructor(
    private readonly networkService: NetworkService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  handleConnection(socket: AuthenticatedSocket): void {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      socket.disconnect();
      return;
    }
    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET') ?? 'dev-access-secret',
      });
      socket.data.user = payload;
    } catch {
      this.logger.warn(`Rejected socket ${socket.id}: invalid token`);
      socket.disconnect();
    }
  }

  @SubscribeMessage('join')
  async handleJoin(@ConnectedSocket() socket: AuthenticatedSocket, @MessageBody() groupId: string) {
    const user = socket.data.user;
    if (!user) return { error: 'Unauthenticated' };
    await this.networkService.assertMember(groupId, user.sub);
    await socket.join(groupId);
    return { joined: groupId };
  }

  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { groupId: string; content: string },
  ) {
    const user = socket.data.user;
    if (!user) return { error: 'Unauthenticated' };
    const message = await this.networkService.sendMessage(data.groupId, user.sub, data.content);
    this.server.to(data.groupId).emit('message', message);
    return message;
  }

  broadcastMessage(groupId: string, message: unknown): void {
    this.server.to(groupId).emit('message', message);
  }
}
