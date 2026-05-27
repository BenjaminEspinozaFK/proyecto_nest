export type VoucherStatus = 'pending' | 'approved' | 'rejected' | 'delivered';

export interface VoucherUserSummary {
  id: string;
  name: string | null;
  email: string;
}

export interface Voucher {
  id: string;
  userId: string;
  kilos: number;
  bank: string | null;
  status: VoucherStatus;
  amount: number | null;
  notes: string | null;
  requestDate: Date;
  approvalDate: Date | null;
  deliveredDate: Date | null;
  approvedBy: string | null;
  user?: VoucherUserSummary;
}
