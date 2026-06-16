import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AdminRepositoryPort } from '../domain/admin.repository';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import {
  AdminAuth,
  AdminPublic,
  AdminUserCreated,
  AdminUserList,
  AdminUserLogin,
  AdminUserRecent,
  CreateAdminInput,
  CreateUserByAdminInput,
  UpdateAdminInput,
  UpdateUserByAdminInput,
  UsersByRoleItem,
} from '../domain/admin.types';

@Injectable()
export class PrismaAdminRepository implements AdminRepositoryPort {
  private adminSelect = {
    id: true,
    email: true,
    name: true,
    rut: true,
    phone: true,
    role: true,
    avatar: true,
    lastLogin: true,
    createdAt: true,
    updatedAt: true,
  };

  private userListSelect = {
    id: true,
    email: true,
    name: true,
    rut: true,
    phone: true,
    role: true,
    createdAt: true,
    updatedAt: true,
  };

  private userCreatedSelect = {
    id: true,
    email: true,
    name: true,
    rut: true,
    phone: true,
    role: true,
    requirePasswordChange: true,
    createdAt: true,
    updatedAt: true,
  };

  private recentUsersSelect = {
    id: true,
    name: true,
    email: true,
    phone: true,
    createdAt: true,
    role: true,
  };

  private recentLoginsSelect = {
    id: true,
    name: true,
    email: true,
    phone: true,
    lastLogin: true,
  };

  constructor(private prisma: PrismaService) {}

  async findAdmins(): Promise<AdminPublic[]> {
    return this.prisma.admin.findMany({ select: this.adminSelect });
  }

  async findAdminById(id: string): Promise<AdminPublic | null> {
    return this.prisma.admin.findUnique({
      where: { id },
      select: this.adminSelect,
    });
  }

  async findAdminByEmail(email: string): Promise<AdminPublic | null> {
    return this.prisma.admin.findUnique({
      where: { email },
      select: this.adminSelect,
    });
  }

  async findAdminAuthById(id: string): Promise<AdminAuth | null> {
    return this.prisma.admin.findUnique({
      where: { id },
      select: { id: true, password: true },
    });
  }

  async createAdmin(data: CreateAdminInput): Promise<AdminPublic> {
    return this.prisma.admin.create({
      data,
      select: this.adminSelect,
    });
  }

  async updateAdmin(id: string, data: UpdateAdminInput): Promise<AdminPublic> {
    return this.prisma.admin.update({
      where: { id },
      data,
      select: this.adminSelect,
    });
  }

  async updateAdminAvatar(id: string, avatar: string): Promise<AdminPublic> {
    return this.prisma.admin.update({
      where: { id },
      data: { avatar },
      select: this.adminSelect,
    });
  }

  async updateAdminPassword(id: string, password: string): Promise<void> {
    await this.prisma.admin.update({
      where: { id },
      data: { password },
    });
  }

  async deleteAdmin(id: string): Promise<void> {
    await this.prisma.admin.delete({ where: { id } });
  }

  async countUsers(): Promise<number> {
    return this.prisma.user.count();
  }

  async countAdmins(): Promise<number> {
    return this.prisma.admin.count();
  }

  async countUsersCreatedAfter(date: Date): Promise<number> {
    return this.prisma.user.count({
      where: { createdAt: { gte: date } },
    });
  }

  async findRecentUsers(limit: number): Promise<AdminUserRecent[]> {
    return this.prisma.user.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: this.recentUsersSelect,
    });
  }

  async findRecentLogins(limit: number): Promise<AdminUserLogin[]> {
    return this.prisma.user.findMany({
      where: { lastLogin: { not: null } },
      take: limit,
      orderBy: { lastLogin: 'desc' },
      select: this.recentLoginsSelect,
    });
  }

  async groupUsersByRole(): Promise<UsersByRoleItem[]> {
    const usersByRole = await this.prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    });

    return usersByRole.map((result) => ({
      role: result.role,
      count: result._count.role,
    }));
  }

  async findAllUsers(page: number, limit: number): Promise<PaginatedResult<AdminUserList>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({ skip, take: limit, select: this.userListSelect }),
      this.prisma.user.count(),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findUserById(id: string): Promise<AdminUserList | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: this.userListSelect,
    });
  }

  async findUserByEmail(email: string): Promise<AdminUserList | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: this.userListSelect,
    });
  }

  async createUserByAdmin(
    data: CreateUserByAdminInput,
  ): Promise<AdminUserCreated> {
    return this.prisma.user.create({
      data,
      select: this.userCreatedSelect,
    });
  }

  async updateUserByAdmin(
    id: string,
    data: UpdateUserByAdminInput,
  ): Promise<AdminUserList> {
    return this.prisma.user.update({
      where: { id },
      data,
      select: this.userListSelect,
    });
  }

  async deleteUser(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
