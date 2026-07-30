import { Module } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuditLogController } from './audit-log.controller';
import { AUDIT_LOG_REPOSITORY } from './audit-log.tokens';
import { PrismaAuditLogRepository } from './infrastructure/prisma-audit-log.repository';

@Module({
  controllers: [AuditLogController],
  providers: [
    AuditLogService,
    { provide: AUDIT_LOG_REPOSITORY, useClass: PrismaAuditLogRepository },
  ],
  exports: [AuditLogService],
})
export class AuditLogModule {}
