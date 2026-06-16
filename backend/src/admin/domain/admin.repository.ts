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
} from './admin.types';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

export interface AdminRepositoryPort {
  findAdmins(): Promise<AdminPublic[]>;
  findAdminById(id: string): Promise<AdminPublic | null>;
  findAdminByEmail(email: string): Promise<AdminPublic | null>;
  findAdminAuthById(id: string): Promise<AdminAuth | null>;
  createAdmin(data: CreateAdminInput): Promise<AdminPublic>;
  updateAdmin(id: string, data: UpdateAdminInput): Promise<AdminPublic>;
  updateAdminAvatar(id: string, avatar: string): Promise<AdminPublic>;
  updateAdminPassword(id: string, password: string): Promise<void>;
  deleteAdmin(id: string): Promise<void>;

  countUsers(): Promise<number>;
  countAdmins(): Promise<number>;
  countUsersCreatedAfter(date: Date): Promise<number>;
  findRecentUsers(limit: number): Promise<AdminUserRecent[]>;
  findRecentLogins(limit: number): Promise<AdminUserLogin[]>;
  groupUsersByRole(): Promise<UsersByRoleItem[]>;

  findAllUsers(page: number, limit: number): Promise<PaginatedResult<AdminUserList>>;
  findUserById(id: string): Promise<AdminUserList | null>;
  findUserByEmail(email: string): Promise<AdminUserList | null>;
  createUserByAdmin(data: CreateUserByAdminInput): Promise<AdminUserCreated>;
  updateUserByAdmin(
    id: string,
    data: UpdateUserByAdminInput,
  ): Promise<AdminUserList>;
  deleteUser(id: string): Promise<void>;
}
