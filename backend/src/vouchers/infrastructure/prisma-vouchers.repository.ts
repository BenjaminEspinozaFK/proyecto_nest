import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { VouchersRepositoryPort } from '../domain/voucher.repository';
import { Voucher } from '../domain/voucher.types';

@Injectable()
export class PrismaVouchersRepository implements VouchersRepositoryPort {
  private userSelect = {
    id: true,
    name: true,
    email: true,
  };

  private voucherInclude = {
    user: { select: this.userSelect },
  };

  constructor(private prisma: PrismaService) {}

  async createVoucher(
    userId: string,
    kilos: number,
    bank?: string,
  ): Promise<Voucher> {
    return this.prisma.gasVoucher.create({
      data: {
        userId,
        kilos,
        bank,
        status: 'pending',
      },
      include: this.voucherInclude,
    });
  }

  async findUserVouchers(userId: string): Promise<Voucher[]> {
    return this.prisma.gasVoucher.findMany({
      where: { userId },
      orderBy: { requestDate: 'desc' },
      include: this.voucherInclude,
    });
  }

  async findPendingVouchers(): Promise<Voucher[]> {
    return this.prisma.gasVoucher.findMany({
      where: { status: 'pending' },
      orderBy: { requestDate: 'asc' },
      include: this.voucherInclude,
    });
  }

  async findAllVouchers(): Promise<Voucher[]> {
    return this.prisma.gasVoucher.findMany({
      orderBy: { requestDate: 'desc' },
      include: this.voucherInclude,
    });
  }

  async approveVoucher(
    voucherId: string,
    amount: number,
    adminId: string,
    notes?: string,
  ): Promise<Voucher> {
    return this.prisma.gasVoucher.update({
      where: { id: voucherId },
      data: {
        status: 'approved',
        amount,
        approvalDate: new Date(),
        approvedBy: adminId,
        notes,
      },
      include: this.voucherInclude,
    });
  }

  async rejectVoucher(
    voucherId: string,
    adminId: string,
    notes?: string,
  ): Promise<Voucher> {
    return this.prisma.gasVoucher.update({
      where: { id: voucherId },
      data: {
        status: 'rejected',
        approvedBy: adminId,
        notes,
      },
      include: this.voucherInclude,
    });
  }

  async markAsDelivered(voucherId: string): Promise<Voucher> {
    return this.prisma.gasVoucher.update({
      where: { id: voucherId },
      data: {
        status: 'delivered',
        deliveredDate: new Date(),
      },
      include: this.voucherInclude,
    });
  }

  async createManualVoucher(
    userId: string,
    kilos: number,
    amount: number,
    adminId: string,
    notes?: string,
  ): Promise<Voucher> {
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
      include: this.voucherInclude,
    });
  }
}
