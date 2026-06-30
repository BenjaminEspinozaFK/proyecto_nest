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
  setUserVerificationToken(
    id: string,
    token: string,
    expiresAt: Date,
  ): Promise<void>;
  findUserByVerificationToken(
    token: string,
    now: Date,
  ): Promise<ResetTokenTarget | null>;
  verifyUserEmail(id: string): Promise<void>;
  setUserTwoFactorSecret(id: string, secret: string): Promise<void>;
  enableUserTwoFactor(id: string): Promise<void>;
  disableUserTwoFactor(id: string): Promise<void>;
  getUserTwoFactorSecret(
    id: string,
  ): Promise<{ twoFactorSecret: string | null } | null>;
  setUserRefreshToken(
    id: string,
    token: string,
    expiresAt: Date,
  ): Promise<void>;
  setAdminRefreshToken(
    id: string,
    token: string,
    expiresAt: Date,
  ): Promise<void>;
  findUserByRefreshToken(token: string): Promise<ResetTokenTarget | null>;
  findAdminByRefreshToken(token: string): Promise<ResetTokenTarget | null>;
  clearUserRefreshToken(id: string): Promise<void>;
  clearAdminRefreshToken(id: string): Promise<void>;
  incrementUserFailedAttempts(id: string): Promise<void>;
  incrementAdminFailedAttempts(id: string): Promise<void>;
  lockUserAccount(id: string, until: Date): Promise<void>;
  lockAdminAccount(id: string, until: Date): Promise<void>;
  resetUserFailedAttempts(id: string): Promise<void>;
  resetAdminFailedAttempts(id: string): Promise<void>;
}
