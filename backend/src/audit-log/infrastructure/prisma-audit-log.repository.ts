import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { AuditLogRepositoryPort } from '../domain/audit-log.repository';
import {
  AuditLog,
  CreateAuditLogInput,
  AuditLogFilters,
} from '../domain/audit-log.types';

@Injectable()
export class PrismaAuditLogRepository implements AuditLogRepositoryPort {
  constructor(private prisma: PrismaService) {}

  private buildWhere(filters: AuditLogFilters): Prisma.AuditLogWhereInput {
    return {
      ...(filters.adminId ? { adminId: filters.adminId } : {}),
      ...(filters.entityType ? { entityType: filters.entityType } : {}),
      ...(filters.action ? { action: filters.action } : {}),
      ...(filters.from || filters.to
        ? {
            createdAt: {
              ...(filters.from ? { gte: filters.from } : {}),
              ...(filters.to ? { lte: filters.to } : {}),
            },
          }
        : {}),
    };
  }

  create(data: CreateAuditLogInput): Promise<AuditLog> {
    return this.prisma.auditLog.create({ data });
  }

  list(
    filters: AuditLogFilters,
    take: number,
    skip: number,
  ): Promise<AuditLog[]> {
    return this.prisma.auditLog.findMany({
      where: this.buildWhere(filters),
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });
  }

  count(filters: AuditLogFilters): Promise<number> {
    return this.prisma.auditLog.count({ where: this.buildWhere(filters) });
  }

  async distinctAdmins(): Promise<{ id: string; name: string | null }[]> {
    const admins = await this.prisma.auditLog.findMany({
      distinct: ['adminId'],
      select: { adminId: true, adminName: true },
      orderBy: { createdAt: 'desc' },
    });

    return admins.map((a) => ({ id: a.adminId, name: a.adminName }));
  }
}
