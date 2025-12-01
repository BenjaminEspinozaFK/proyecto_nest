import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000', // Frontend URL
    credentials: true,
  },
})
export class VouchersGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('VouchersGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  // Método para unir un cliente a una sala específica (admin o user)
  @SubscribeMessage('join-room')
  async handleJoinRoom(client: Socket, room: string) {
    await client.join(room);
    this.logger.log(`Cliente ${client.id} se unió a la sala: ${room}`);
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
}
