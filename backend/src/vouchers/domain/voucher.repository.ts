import { Voucher } from './voucher.types';

export interface VouchersRepositoryPort {
  createVoucher(userId: string, kilos: number, bank?: string): Promise<Voucher>;
  findUserVouchers(userId: string): Promise<Voucher[]>;
  findPendingVouchers(): Promise<Voucher[]>;
  findAllVouchers(): Promise<Voucher[]>;
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
