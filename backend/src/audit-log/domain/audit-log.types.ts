export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  description: string;
  createdAt: Date;
}

export interface CreateAuditLogInput {
  adminId: string;
  adminName?: string;
  action: string;
  entityType: string;
  entityId?: string;
  description: string;
}

export interface AuditLogFilters {
  adminId?: string;
  entityType?: string;
  action?: string;
  from?: Date;
  to?: Date;
}
