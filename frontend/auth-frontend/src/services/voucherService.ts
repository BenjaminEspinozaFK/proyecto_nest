import {
  GasVoucher,
  VoucherStats,
  CreateVoucherRequest,
  ApproveVoucherRequest,
  RejectVoucherRequest,
  CreateManualVoucherRequest,
} from "../types/voucher";

const API_URL = "http://localhost:3001";

class VoucherService {
  private getAuthHeader() {
    const token = localStorage.getItem("authToken");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  // Funcionario: Solicitar vale
  async requestVoucher(data: CreateVoucherRequest): Promise<GasVoucher> {
    const response = await fetch(`${API_URL}/vouchers/request`, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Error al solicitar vale");
    }

    return response.json();
  }

  // Funcionario: Obtener mis vales
  async getMyVouchers(): Promise<GasVoucher[]> {
    const response = await fetch(`${API_URL}/vouchers/my-vouchers`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error("Error al obtener vales");
    }

    return response.json();
  }

  // Funcionario: Obtener mis estadísticas
  async getMyStats(): Promise<VoucherStats> {
    const response = await fetch(`${API_URL}/vouchers/my-stats`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error("Error al obtener estadísticas");
    }

    return response.json();
  }

  // Admin: Obtener vales pendientes
  async getPendingVouchers(): Promise<GasVoucher[]> {
    const response = await fetch(`${API_URL}/vouchers/pending`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error("Error al obtener vales pendientes");
    }

    return response.json();
  }

  // Admin: Obtener todos los vales
  async getAllVouchers(): Promise<GasVoucher[]> {
    const response = await fetch(`${API_URL}/vouchers/all`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error("Error al obtener todos los vales");
    }

    return response.json();
  }

  // Admin: Obtener vales de un usuario
  async getUserVouchers(userId: string): Promise<GasVoucher[]> {
    const response = await fetch(`${API_URL}/vouchers/user/${userId}`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error("Error al obtener vales del usuario");
    }

    return response.json();
  }

  // Admin: Obtener estadísticas de un usuario
  async getUserStats(userId: string): Promise<VoucherStats> {
    const response = await fetch(`${API_URL}/vouchers/user/${userId}/stats`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error("Error al obtener estadísticas del usuario");
    }

    return response.json();
  }

  // Admin: Aprobar vale
  async approveVoucher(
    voucherId: string,
    data: ApproveVoucherRequest
  ): Promise<GasVoucher> {
    const response = await fetch(`${API_URL}/vouchers/${voucherId}/approve`, {
      method: "PATCH",
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Error al aprobar vale");
    }

    return response.json();
  }

  // Admin: Rechazar vale
  async rejectVoucher(
    voucherId: string,
    data: RejectVoucherRequest
  ): Promise<GasVoucher> {
    const response = await fetch(`${API_URL}/vouchers/${voucherId}/reject`, {
      method: "PATCH",
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Error al rechazar vale");
    }

    return response.json();
  }

  // Admin: Marcar como entregado
  async markAsDelivered(voucherId: string): Promise<GasVoucher> {
    const response = await fetch(`${API_URL}/vouchers/${voucherId}/deliver`, {
      method: "PATCH",
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error("Error al marcar como entregado");
    }

    return response.json();
  }

  // Admin: Crear vale manual
  async createManualVoucher(
    data: CreateManualVoucherRequest
  ): Promise<GasVoucher> {
    const response = await fetch(`${API_URL}/vouchers/manual`, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Error al crear vale manual");
    }

    return response.json();
  }

  // Admin: Obtener estadísticas generales
  async getGeneralStats(): Promise<VoucherStats> {
    const response = await fetch(`${API_URL}/vouchers/stats/general`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error("Error al obtener estadísticas generales");
    }

    return response.json();
  }
}

export const voucherService = new VoucherService();
