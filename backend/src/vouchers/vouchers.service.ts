import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { ApproveVoucherDto } from './dto/approve-voucher.dto';
import { RejectVoucherDto } from './dto/reject-voucher.dto';

@Injectable()
export class VouchersService {
  constructor(private prisma: PrismaService) {}

  // Funcionario solicita un vale
  async requestVoucher(userId: string, createVoucherDto: CreateVoucherDto) {
    return this.prisma.gasVoucher.create({
      data: {
        userId,
        kilos: createVoucherDto.kilos,
        status: 'pending',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Obtener vales de un usuario específico
  async getUserVouchers(userId: string) {
    return this.prisma.gasVoucher.findMany({
      where: { userId },
      orderBy: { requestDate: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Admin: Obtener todos los vales pendientes
  async getPendingVouchers() {
    return this.prisma.gasVoucher.findMany({
      where: { status: 'pending' },
      orderBy: { requestDate: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Admin: Obtener todos los vales
  async getAllVouchers() {
    return this.prisma.gasVoucher.findMany({
      orderBy: { requestDate: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Admin: Aprobar vale
  async approveVoucher(
    voucherId: string,
    approveVoucherDto: ApproveVoucherDto,
    adminId: string,
  ) {
    return this.prisma.gasVoucher.update({
      where: { id: voucherId },
      data: {
        status: 'approved',
        amount: approveVoucherDto.amount,
        approvalDate: new Date(),
        approvedBy: adminId,
        notes: approveVoucherDto.notes,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Admin: Rechazar vale
  async rejectVoucher(
    voucherId: string,
    rejectVoucherDto: RejectVoucherDto,
    adminId: string,
  ) {
    return this.prisma.gasVoucher.update({
      where: { id: voucherId },
      data: {
        status: 'rejected',
        approvedBy: adminId,
        notes: rejectVoucherDto.notes,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Admin: Marcar como entregado
  async markAsDelivered(voucherId: string) {
    return this.prisma.gasVoucher.update({
      where: { id: voucherId },
      data: {
        status: 'delivered',
        deliveredDate: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Admin: Crear vale manual (asignar directamente)
  async createManualVoucher(
    userId: string,
    kilos: number,
    amount: number,
    adminId: string,
    notes?: string,
  ) {
    return this.prisma.gasVoucher.create({
      data: {
        userId,
        kilos,
        amount,
        status: 'approved',
        approvalDate: new Date(),
        approvedBy: adminId,
        notes,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Estadísticas de un usuario
  async getUserVoucherStats(userId: string) {
    const vouchers = await this.prisma.gasVoucher.findMany({
      where: { userId },
    });

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
  async getGeneralStats() {
    const vouchers = await this.prisma.gasVoucher.findMany();

    const total = vouchers.length;
    const pending = vouchers.filter((v) => v.status === 'pending').length;
    const approved = vouchers.filter((v) => v.status === 'approved').length;
    const delivered = vouchers.filter((v) => v.status === 'delivered').length;
    const rejected = vouchers.filter((v) => v.status === 'rejected').length;
    const totalAmount = vouchers
      .filter((v) => v.amount)
      .reduce((sum, v) => sum + (v.amount || 0), 0);

    // Vales de este mes
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = vouchers.filter(
      (v) => v.requestDate >= startOfMonth,
    ).length;

    return {
      total,
      pending,
      approved,
      delivered,
      rejected,
      totalAmount,
      thisMonth,
    };
  }
}
