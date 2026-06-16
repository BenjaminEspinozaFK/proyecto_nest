import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { VouchersRepositoryPort } from '../domain/voucher.repository';
import { Voucher } from '../domain/voucher.types';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

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

  async findAllVouchers(page: number, limit: number): Promise<PaginatedResult<Voucher>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.gasVoucher.findMany({
        skip,
        take: limit,
        orderBy: { requestDate: 'desc' },
        include: this.voucherInclude,
      }),
      this.prisma.gasVoucher.count(),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
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

  async getVoucherStats() {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const [total, pending, approved, delivered, rejected, amountResult, thisMonth] =
      await Promise.all([
        this.prisma.gasVoucher.count(),
        this.prisma.gasVoucher.count({ where: { status: 'pending' } }),
        this.prisma.gasVoucher.count({ where: { status: 'approved' } }),
        this.prisma.gasVoucher.count({ where: { status: 'delivered' } }),
        this.prisma.gasVoucher.count({ where: { status: 'rejected' } }),
        this.prisma.gasVoucher.aggregate({ _sum: { amount: true } }),
        this.prisma.gasVoucher.count({ where: { requestDate: { gte: startOfMonth } } }),
      ]);
    return {
      total,
      pending,
      approved,
      delivered,
      rejected,
      totalAmount: amountResult._sum.amount ?? 0,
      thisMonth,
    };
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
