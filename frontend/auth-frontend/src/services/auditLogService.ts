import api from "./authService";
import {
  AuditLogFilters,
  AuditLogListResponse,
  AuditLogFilterOptions,
} from "../types/auditLog";

export const auditLogService = {
  async list(filters: AuditLogFilters): Promise<AuditLogListResponse> {
    const params = new URLSearchParams();
    if (filters.adminId) params.set("adminId", filters.adminId);
    if (filters.entityType) params.set("entityType", filters.entityType);
    if (filters.action) params.set("action", filters.action);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    if (filters.page) params.set("page", String(filters.page));
    if (filters.pageSize) params.set("pageSize", String(filters.pageSize));

    const response = await api.get<AuditLogListResponse>(
      `/audit-log?${params.toString()}`,
    );
    return response.data;
  },

  async getFilterOptions(): Promise<AuditLogFilterOptions> {
    const response = await api.get<AuditLogFilterOptions>(
      "/audit-log/filter-options",
    );
    return response.data;
  },
};
