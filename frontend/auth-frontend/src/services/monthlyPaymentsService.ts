import api from "./authService";
import { MonthlyPayment, PaymentSummary } from "../types/payment";

class MonthlyPaymentsService {
  async createPayment(
    userId: string,
    year: number,
    month: number,
    amount: number,
    description?: string,
  ): Promise<MonthlyPayment> {
    const response = await api.post<MonthlyPayment>("/monthly-payments", {
      userId,
      year,
      month,
      amount,
      description,
    });
    return response.data;
  }

  async getUserPayments(userId: string): Promise<MonthlyPayment[]> {
    const response = await api.get<MonthlyPayment[]>(
      `/monthly-payments/user/${userId}`,
    );
    return response.data;
  }

  async getPaymentSummary(userId: string): Promise<PaymentSummary[]> {
    const response = await api.get<PaymentSummary[]>(
      `/monthly-payments/user/${userId}/summary`,
    );
    return response.data;
  }

  async getUserPaymentsByYear(
    userId: string,
    year: number,
  ): Promise<MonthlyPayment[]> {
    const response = await api.get<MonthlyPayment[]>(
      `/monthly-payments/user/${userId}/year/${year}`,
    );
    return response.data;
  }

  async updatePayment(
    id: string,
    amount?: number,
    description?: string,
  ): Promise<MonthlyPayment> {
    const response = await api.patch<MonthlyPayment>(
      `/monthly-payments/${id}`,
      { amount, description },
    );
    return response.data;
  }

  async deletePayment(id: string): Promise<void> {
    await api.delete(`/monthly-payments/${id}`);
  }

  async getMyPayments(): Promise<MonthlyPayment[]> {
    const response = await api.get<MonthlyPayment[]>(
      "/monthly-payments/my-payments",
    );
    return response.data;
  }

  async getMyPaymentSummary(): Promise<PaymentSummary[]> {
    const response = await api.get<PaymentSummary[]>(
      "/monthly-payments/my-payments/summary",
    );
    return response.data;
  }

  async getMyPaymentsByYear(year: number): Promise<MonthlyPayment[]> {
    const response = await api.get<MonthlyPayment[]>(
      `/monthly-payments/my-payments/year/${year}`,
    );
    return response.data;
  }
}

export const monthlyPaymentsService = new MonthlyPaymentsService();
