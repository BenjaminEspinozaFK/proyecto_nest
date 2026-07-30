export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  description: string;
  createdAt: string;
}

export interface AuditLogFilters {
  adminId?: string;
  entityType?: string;
  action?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface AuditLogListResponse {
  items: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AuditLogFilterOptions {
  admins: { id: string; name: string | null }[];
}
