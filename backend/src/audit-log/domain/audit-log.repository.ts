import {
  AuditLog,
  CreateAuditLogInput,
  AuditLogFilters,
} from './audit-log.types';

export interface AuditLogRepositoryPort {
  create(data: CreateAuditLogInput): Promise<AuditLog>;
  list(
    filters: AuditLogFilters,
    take: number,
    skip: number,
  ): Promise<AuditLog[]>;
  count(filters: AuditLogFilters): Promise<number>;
  distinctAdmins(): Promise<{ id: string; name: string | null }[]>;
}
