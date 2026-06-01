import {
  CreateMonthlyPaymentInput,
  MonthlyPayment,
  UpdateMonthlyPaymentInput,
} from './monthly-payment.types';

export interface MonthlyPaymentsRepositoryPort {
  createPayment(data: CreateMonthlyPaymentInput): Promise<MonthlyPayment>;
  findUserPayments(userId: string): Promise<MonthlyPayment[]>;
  findUserPaymentsByYear(
    userId: string,
    year: number,
  ): Promise<MonthlyPayment[]>;
  findPaymentByUserYearMonth(
    userId: string,
    year: number,
    month: number,
  ): Promise<MonthlyPayment | null>;
  sumUserYear(userId: string, year: number): Promise<number>;
  sumUserTotal(userId: string): Promise<number>;
  updatePayment(
    id: string,
    data: UpdateMonthlyPaymentInput,
  ): Promise<MonthlyPayment>;
  deletePayment(id: string): Promise<MonthlyPayment>;
  findUserPaymentsForSummary(userId: string): Promise<MonthlyPayment[]>;
}
