export interface GasVoucher {
  id: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  kilos: number;
  amount?: number;
  bank?: string;
  status: "pending" | "approved" | "rejected" | "delivered";
  requestDate: string;
  approvalDate?: string;
  deliveredDate?: string;
  approvedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VoucherStats {
  total: number;
  pending: number;
  approved: number;
  delivered: number;
  rejected: number;
  totalAmount: number;
  thisMonth?: number;
}

export interface CreateVoucherRequest {
  kilos: number;
  bank?: string;
}

export interface ApproveVoucherRequest {
  amount: number;
  notes?: string;
}

export interface RejectVoucherRequest {
  notes?: string;
}

export interface CreateManualVoucherRequest {
  userId: string;
  kilos: number;
  amount: number;
  notes?: string;
}
