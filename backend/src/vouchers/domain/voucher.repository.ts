import { Voucher } from './voucher.types';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

export interface VouchersRepositoryPort {
  createVoucher(userId: string, kilos: number, bank?: string): Promise<Voucher>;
  findUserVouchers(userId: string): Promise<Voucher[]>;
  findPendingVouchers(): Promise<Voucher[]>;
  findAllVouchers(page: number, limit: number): Promise<PaginatedResult<Voucher>>;
  getVoucherStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    delivered: number;
    rejected: number;
    totalAmount: number;
    thisMonth: number;
  }>;
  approveVoucher(
    voucherId: string,
    amount: number,
    adminId: string,
    notes?: string,
  ): Promise<Voucher>;
  rejectVoucher(
    voucherId: string,
    adminId: string,
    notes?: string,
  ): Promise<Voucher>;
  markAsDelivered(voucherId: string): Promise<Voucher>;
  createManualVoucher(
    userId: string,
    kilos: number,
    amount: number,
    adminId: string,
    notes?: string,
  ): Promise<Voucher>;
}
