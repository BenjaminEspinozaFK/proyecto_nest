import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface JwtPayload {
  sub: string;
  email: string;
  name?: string;
  role: string;
}

interface SocketUser {
  userId: string;
  email: string;
  name?: string;
  role: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
})
export class VouchersGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private logger = new Logger('VouchersGateway');

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

      client.data.user = {
        userId: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      } satisfies SocketUser;

      this.logger.log(
        `Cliente autenticado conectado: ${client.id} (${payload.role})`,
      );
    } catch {
      this.logger.warn(
        `Conexión rechazada (token inválido o expirado): ${client.id}`,
      );
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  private extractToken(client: Socket): string {
    const token = client.handshake.auth?.token;
    if (typeof token === 'string' && token.length > 0) {
      return token;
    }

    const queryToken = client.handshake.query?.token;
    if (typeof queryToken === 'string' && queryToken.length > 0) {
      return queryToken;
    }

    throw new Error('Token no proporcionado');
  }

  // Método para unir un cliente a una sala específica (admin o user)
  @SubscribeMessage('join-room')
  async handleJoinRoom(client: Socket, room: string) {
    const user = client.data.user as SocketUser | undefined;

    if (!user) {
      this.logger.warn(
        `Cliente no autenticado intentó unirse a la sala: ${room}`,
      );
      return { event: 'join-error', data: 'No autenticado' };
    }

    const isAuthorized =
      (room === 'admin' && user.role === 'admin') ||
      room === `user:${user.userId}`;

    if (!isAuthorized) {
      this.logger.warn(
        `Cliente ${client.id} (${user.role}) intentó unirse a la sala no permitida: ${room}`,
      );
      return {
        event: 'join-error',
        data: 'No tienes permiso para unirte a esta sala',
      };
    }

    await client.join(room);
    this.logger.log(`Cliente ${client.id} se unió a la sala: ${room}`);
    return { event: 'joined', data: room };
  }

  // Método para notificar nuevo vale creado (solo a admins)
  notifyVoucherCreated(voucher: any) {
    this.server.to('admin').emit('voucher:created', voucher);
    this.logger.log('Evento voucher:created emitido a admins');
  }

  // Método para notificar vale aprobado (al usuario específico y admins)
  notifyVoucherApproved(voucher: any) {
    this.server.to('admin').emit('voucher:approved', voucher);
    this.server.to(`user:${voucher.userId}`).emit('voucher:approved', voucher);
    this.logger.log(`Evento voucher:approved emitido para vale ${voucher.id}`);
  }

  // Método para notificar vale rechazado (al usuario específico y admins)
  notifyVoucherRejected(voucher: any) {
    this.server.to('admin').emit('voucher:rejected', voucher);
    this.server.to(`user:${voucher.userId}`).emit('voucher:rejected', voucher);
    this.logger.log(`Evento voucher:rejected emitido para vale ${voucher.id}`);
  }

  // Método para notificar vale entregado (al usuario específico y admins)
  notifyVoucherDelivered(voucher: any) {
    this.server.to('admin').emit('voucher:delivered', voucher);
    this.server.to(`user:${voucher.userId}`).emit('voucher:delivered', voucher);
    this.logger.log(`Evento voucher:delivered emitido para vale ${voucher.id}`);
  }

  // Método para notificar actualización general de vales
  notifyVoucherUpdated(voucher: any) {
    this.server.emit('voucher:updated', voucher);
    this.logger.log(`Evento voucher:updated emitido para vale ${voucher.id}`);
  }

  // Método genérico para avisar que hay una notificación nueva en una sala
  notifyNewNotification(room: string) {
    this.server.to(room).emit('notification:new');
    this.logger.log(`Evento notification:new emitido a la sala: ${room}`);
  }
}
