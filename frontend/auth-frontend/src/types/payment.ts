export interface MonthlyPayment {
  id: string;
  userId: string;
  year: number;
  month: number;
  amount: number;
  description?: string;
  paymentDate: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  user?: { id: string; name: string; email: string; rut: string };
}

export interface PaymentSummary {
  year: number;
  total: number;
  months: Array<{ month: number; amount: number; description?: string }>;
}
