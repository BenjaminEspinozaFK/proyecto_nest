import api from "./authService";
import {
  GasVoucher,
  VoucherStats,
  CreateVoucherRequest,
  ApproveVoucherRequest,
  RejectVoucherRequest,
  CreateManualVoucherRequest,
} from "../types/voucher";

interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

class VoucherService {
  // Funcionario: Solicitar vale
  async requestVoucher(data: CreateVoucherRequest): Promise<GasVoucher> {
    const response = await api.post<GasVoucher>("/vouchers/request", data);
    return response.data;
  }

  // Funcionario: Ver mis vales
  async getMyVouchers(): Promise<GasVoucher[]> {
    const response = await api.get<GasVoucher[]>("/vouchers/my-vouchers");
    return response.data;
  }

  // Funcionario: Ver mis estadísticas
  async getMyStats(): Promise<VoucherStats> {
    const response = await api.get<VoucherStats>("/vouchers/my-stats");
    return response.data;
  }

  // Admin: Ver vales pendientes
  async getPendingVouchers(): Promise<GasVoucher[]> {
    const response = await api.get<GasVoucher[]>("/vouchers/pending");
    return response.data;
  }

  // Admin: Ver todos los vales (limit alto para vista completa / estadísticas)
  async getAllVouchers(limit = 500): Promise<GasVoucher[]> {
    const response = await api.get<PaginatedResponse<GasVoucher>>(
      `/vouchers/all?page=1&limit=${limit}`,
    );
    return response.data.data;
  }

  // Admin: Ver vales de un usuario específico
  async getUserVouchers(userId: string): Promise<GasVoucher[]> {
    const response = await api.get<GasVoucher[]>(`/vouchers/user/${userId}`);
    return response.data;
  }

  // Admin: Ver estadísticas de un usuario específico
  async getUserStats(userId: string): Promise<VoucherStats> {
    const response = await api.get<VoucherStats>(
      `/vouchers/user/${userId}/stats`,
    );
    return response.data;
  }

  // Admin: Aprobar vale
  async approveVoucher(
    voucherId: string,
    data: ApproveVoucherRequest,
  ): Promise<GasVoucher> {
    const response = await api.patch<GasVoucher>(
      `/vouchers/${voucherId}/approve`,
      data,
    );
    return response.data;
  }

  // Admin: Rechazar vale
  async rejectVoucher(
    voucherId: string,
    data: RejectVoucherRequest,
  ): Promise<GasVoucher> {
    const response = await api.patch<GasVoucher>(
      `/vouchers/${voucherId}/reject`,
      data,
    );
    return response.data;
  }

  // Admin: Marcar vale como entregado
  async markAsDelivered(voucherId: string): Promise<GasVoucher> {
    const response = await api.patch<GasVoucher>(
      `/vouchers/${voucherId}/deliver`,
    );
    return response.data;
  }

  // Admin: Crear vale manual
  async createManualVoucher(
    data: CreateManualVoucherRequest,
  ): Promise<GasVoucher> {
    const response = await api.post<GasVoucher>("/vouchers/manual", data);
    return response.data;
  }

  // Admin: Ver estadísticas generales
  async getGeneralStats(): Promise<VoucherStats> {
    const response = await api.get<VoucherStats>("/vouchers/stats/general");
    return response.data;
  }
}

export const voucherService = new VoucherService();
