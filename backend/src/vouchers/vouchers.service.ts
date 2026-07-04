import { Inject, Injectable } from '@nestjs/common';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { ApproveVoucherDto } from './dto/approve-voucher.dto';
import { RejectVoucherDto } from './dto/reject-voucher.dto';
import { VouchersGateway } from './vouchers.gateway';
import { VouchersRepositoryPort } from './domain/voucher.repository';
import { VOUCHERS_REPOSITORY } from './vouchers.tokens';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class VouchersService {
  constructor(
    @Inject(VOUCHERS_REPOSITORY)
    private vouchersRepository: VouchersRepositoryPort,
    private vouchersGateway: VouchersGateway,
    private notificationsService: NotificationsService,
  ) {}

  // Funcionario solicita un vale
  async requestVoucher(userId: string, createVoucherDto: CreateVoucherDto) {
    const voucher = await this.vouchersRepository.createVoucher(
      userId,
      createVoucherDto.kilos,
      createVoucherDto.bank,
    );

    // Emitir evento de nuevo vale creado a los admins
    this.vouchersGateway.notifyVoucherCreated(voucher);

    // Notificar a todos los admins
    await this.notificationsService.notifyAllAdmins(
      'Nueva solicitud de vale',
      `${voucher.user?.name || 'Un usuario'} solicitó ${voucher.kilos} kg de gas`,
      '/dashboard',
    );
    this.vouchersGateway.notifyNewNotification('admin');

    return voucher;
  }

  // Obtener vales de un usuario específico
  async getUserVouchers(userId: string) {
    return this.vouchersRepository.findUserVouchers(userId);
  }

  // Admin: Obtener todos los vales pendientes
  async getPendingVouchers() {
    return this.vouchersRepository.findPendingVouchers();
  }

  // Admin: Obtener todos los vales
  async getAllVouchers(page: number, limit: number) {
    return this.vouchersRepository.findAllVouchers(page, limit);
  }

  // Admin: Aprobar vale
  async approveVoucher(
    voucherId: string,
    approveVoucherDto: ApproveVoucherDto,
    adminId: string,
  ) {
    const voucher = await this.vouchersRepository.approveVoucher(
      voucherId,
      approveVoucherDto.amount,
      adminId,
      approveVoucherDto.notes,
    );

    // Emitir evento de vale aprobado
    this.vouchersGateway.notifyVoucherApproved(voucher);

    // Notificar al usuario
    await this.notificationsService.notifyUser(
      voucher.userId,
      'Vale aprobado',
      `Tu solicitud de ${voucher.kilos} kg fue aprobada por $${approveVoucherDto.amount}`,
      '/dashboard',
    );
    this.vouchersGateway.notifyNewNotification(`user:${voucher.userId}`);

    return voucher;
  }

  // Admin: Rechazar vale
  async rejectVoucher(
    voucherId: string,
    rejectVoucherDto: RejectVoucherDto,
    adminId: string,
  ) {
    const voucher = await this.vouchersRepository.rejectVoucher(
      voucherId,
      adminId,
      rejectVoucherDto.notes,
    );

    // Emitir evento de vale rechazado
    this.vouchersGateway.notifyVoucherRejected(voucher);

    // Notificar al usuario
    await this.notificationsService.notifyUser(
      voucher.userId,
      'Vale rechazado',
      rejectVoucherDto.notes
        ? `Tu solicitud de ${voucher.kilos} kg fue rechazada: ${rejectVoucherDto.notes}`
        : `Tu solicitud de ${voucher.kilos} kg fue rechazada`,
      '/dashboard',
    );
    this.vouchersGateway.notifyNewNotification(`user:${voucher.userId}`);

    return voucher;
  }

  // Admin: Marcar como entregado
  async markAsDelivered(voucherId: string) {
    const voucher = await this.vouchersRepository.markAsDelivered(voucherId);

    // Emitir evento de vale entregado
    this.vouchersGateway.notifyVoucherDelivered(voucher);

    // Notificar al usuario
    await this.notificationsService.notifyUser(
      voucher.userId,
      'Vale entregado',
      `Tu vale de ${voucher.kilos} kg fue marcado como entregado`,
      '/dashboard',
    );
    this.vouchersGateway.notifyNewNotification(`user:${voucher.userId}`);

    return voucher;
  }

  // Admin: Crear vale manual (asignar directamente)
  async createManualVoucher(
    userId: string,
    kilos: number,
    amount: number,
    adminId: string,
    notes?: string,
  ) {
    return this.vouchersRepository.createManualVoucher(
      userId,
      kilos,
      amount,
      adminId,
      notes,
    );
  }

  // Estadísticas de un usuario
  async getUserVoucherStats(userId: string) {
    const vouchers = await this.vouchersRepository.findUserVouchers(userId);

    const total = vouchers.length;
    const pending = vouchers.filter((v) => v.status === 'pending').length;
    const approved = vouchers.filter((v) => v.status === 'approved').length;
    const delivered = vouchers.filter((v) => v.status === 'delivered').length;
    const rejected = vouchers.filter((v) => v.status === 'rejected').length;
    const totalAmount = vouchers
      .filter((v) => v.amount)
      .reduce((sum, v) => sum + (v.amount || 0), 0);

    return {
      total,
      pending,
      approved,
      delivered,
      rejected,
      totalAmount,
    };
  }

  // Estadísticas generales (para admin)
  getGeneralStats() {
    return this.vouchersRepository.getVoucherStats();
  }
}
