const API_URL = "http://localhost:3001";

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
  user?: {
    id: string;
    name: string;
    email: string;
    rut: string;
  };
}

export interface PaymentSummary {
  year: number;
  total: number;
  months: Array<{
    month: number;
    amount: number;
    description?: string;
  }>;
}

class MonthlyPaymentsService {
  private getAuthHeader() {
    const token = localStorage.getItem("authToken");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  async createPayment(
    userId: string,
    year: number,
    month: number,
    amount: number,
    description?: string
  ): Promise<MonthlyPayment> {
    const response = await fetch(`${API_URL}/monthly-payments`, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: JSON.stringify({ userId, year, month, amount, description }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async getUserPayments(userId: string): Promise<MonthlyPayment[]> {
    const response = await fetch(
      `${API_URL}/monthly-payments/user/${userId}`,
      {
        headers: this.getAuthHeader(),
      }
    );

    if (!response.ok) {
      throw new Error("Error al obtener los pagos");
    }

    return response.json();
  }

  async getPaymentSummary(userId: string): Promise<PaymentSummary[]> {
    const response = await fetch(
      `${API_URL}/monthly-payments/user/${userId}/summary`,
      {
        headers: this.getAuthHeader(),
      }
    );

    if (!response.ok) {
      throw new Error("Error al obtener el resumen");
    }

    return response.json();
  }

  async getUserPaymentsByYear(
    userId: string,
    year: number
  ): Promise<MonthlyPayment[]> {
    const response = await fetch(
      `${API_URL}/monthly-payments/user/${userId}/year/${year}`,
      {
        headers: this.getAuthHeader(),
      }
    );

    if (!response.ok) {
      throw new Error("Error al obtener los pagos del año");
    }

    return response.json();
  }

  async updatePayment(
    id: string,
    amount?: number,
    description?: string
  ): Promise<MonthlyPayment> {
    const response = await fetch(`${API_URL}/monthly-payments/${id}`, {
      method: "PATCH",
      headers: this.getAuthHeader(),
      body: JSON.stringify({ amount, description }),
    });

    if (!response.ok) {
      throw new Error("Error al actualizar el pago");
    }

    return response.json();
  }

  async deletePayment(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/monthly-payments/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error("Error al eliminar el pago");
    }
  }
}

export const monthlyPaymentsService = new MonthlyPaymentsService();
