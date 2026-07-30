import { Inject, Injectable, Logger } from '@nestjs/common';
import { AuditLogRepositoryPort } from './domain/audit-log.repository';
import { AUDIT_LOG_REPOSITORY } from './audit-log.tokens';
import { AuditLogFilters } from './domain/audit-log.types';

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @Inject(AUDIT_LOG_REPOSITORY)
    private auditLogRepository: AuditLogRepositoryPort,
  ) {}

  // El registro de auditoría nunca debe romper la operación principal
  async log(
    adminId: string,
    adminName: string | undefined,
    action: string,
    entityType: string,
    description: string,
    entityId?: string,
  ): Promise<void> {
    try {
      await this.auditLogRepository.create({
        adminId,
        adminName,
        action,
        entityType,
        entityId,
        description,
      });
    } catch (error) {
      this.logger.error('Error registrando audit log:', error);
    }
  }

  async list(filters: AuditLogFilters, page = 1, pageSize = 20) {
    const safePage = Math.max(1, page);
    const safePageSize = Math.min(100, Math.max(1, pageSize));
    const skip = (safePage - 1) * safePageSize;

    const [items, total] = await Promise.all([
      this.auditLogRepository.list(filters, safePageSize, skip),
      this.auditLogRepository.count(filters),
    ]);

    return {
      items,
      total,
      page: safePage,
      pageSize: safePageSize,
      totalPages: Math.ceil(total / safePageSize),
    };
  }

  async getFilterOptions() {
    const admins = await this.auditLogRepository.distinctAdmins();
    return { admins };
  }
}
