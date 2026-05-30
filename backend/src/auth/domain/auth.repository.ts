import {
  AuthAdmin,
  AuthAdminProfile,
  AuthUser,
  AuthUserProfile,
  CreateAuthUserInput,
  ResetTokenTarget,
} from './auth.types';

export interface AuthRepositoryPort {
  findAdminByEmail(email: string): Promise<AuthAdmin | null>;
  findUserByEmail(email: string): Promise<AuthUser | null>;
  createUser(data: CreateAuthUserInput): Promise<AuthUser>;
  updateAdminLastLogin(id: string, lastLogin: Date): Promise<void>;
  updateUserLastLogin(id: string, lastLogin: Date): Promise<void>;
  setAdminResetToken(id: string, token: string, expiresAt: Date): Promise<void>;
  setUserResetToken(id: string, token: string, expiresAt: Date): Promise<void>;
  findAdminByResetToken(
    token: string,
    now: Date,
  ): Promise<ResetTokenTarget | null>;
  findUserByResetToken(
    token: string,
    now: Date,
  ): Promise<ResetTokenTarget | null>;
  resetAdminPassword(id: string, hashedPassword: string): Promise<void>;
  resetUserPassword(id: string, hashedPassword: string): Promise<void>;
  getAdminProfile(id: string): Promise<AuthAdminProfile | null>;
  getUserProfile(id: string): Promise<AuthUserProfile | null>;
}
