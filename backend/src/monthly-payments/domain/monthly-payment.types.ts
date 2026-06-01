export interface MonthlyPaymentUserSummary {
  id: string;
  name: string | null;
  email: string;
  rut: string;
}

export interface MonthlyPayment {
  id: string;
  userId: string;
  year: number;
  month: number;
  amount: number;
  description: string | null;
  paymentDate: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  user?: MonthlyPaymentUserSummary;
}

export interface CreateMonthlyPaymentInput {
  userId: string;
  year: number;
  month: number;
  amount: number;
  description?: string;
  createdBy: string;
}

export interface UpdateMonthlyPaymentInput {
  amount?: number;
  description?: string;
}
