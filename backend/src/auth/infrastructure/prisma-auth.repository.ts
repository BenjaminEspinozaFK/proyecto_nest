import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AuthRepositoryPort } from '../domain/auth.repository';
import {
  AuthAdmin,
  AuthAdminProfile,
  AuthUser,
  AuthUserProfile,
  CreateAuthUserInput,
  ResetTokenTarget,
} from '../domain/auth.types';

@Injectable()
export class PrismaAuthRepository implements AuthRepositoryPort {
  private adminAuthSelect = {
    id: true,
    email: true,
    password: true,
    name: true,
    rut: true,
    phone: true,
    role: true,
    avatar: true,
    lastLogin: true,
    createdAt: true,
    updatedAt: true,
  };

  private userAuthSelect = {
    id: true,
    email: true,
    password: true,
    name: true,
    rut: true,
    phone: true,
    role: true,
    avatar: true,
    lastLogin: true,
    requirePasswordChange: true,
    createdAt: true,
    updatedAt: true,
  };

  private adminProfileSelect = {
    id: true,
    email: true,
    name: true,
    rut: true,
    role: true,
    avatar: true,
    lastLogin: true,
    createdAt: true,
    updatedAt: true,
  };

  private userProfileSelect = {
    id: true,
    email: true,
    name: true,
    rut: true,
    role: true,
    avatar: true,
    lastLogin: true,
    requirePasswordChange: true,
    createdAt: true,
    updatedAt: true,
  };

  private resetTargetSelect = { id: true };

  constructor(private prisma: PrismaService) {}

  async findAdminByEmail(email: string): Promise<AuthAdmin | null> {
    return this.prisma.admin.findUnique({
      where: { email },
      select: this.adminAuthSelect,
    });
  }

  async findUserByEmail(email: string): Promise<AuthUser | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: this.userAuthSelect,
    });
  }

  async createUser(data: CreateAuthUserInput): Promise<AuthUser> {
    return this.prisma.user.create({
      data,
      select: this.userAuthSelect,
    });
  }

  async updateAdminLastLogin(id: string, lastLogin: Date): Promise<void> {
    await this.prisma.admin.update({
      where: { id },
      data: { lastLogin },
    });
  }

  async updateUserLastLogin(id: string, lastLogin: Date): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { lastLogin },
    });
  }

  async setAdminResetToken(
    id: string,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.prisma.admin.update({
      where: { id },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expiresAt,
      },
    });
  }

  async setUserResetToken(
    id: string,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expiresAt,
      },
    });
  }

  async findAdminByResetToken(
    token: string,
    now: Date,
  ): Promise<ResetTokenTarget | null> {
    return this.prisma.admin.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gte: now },
      },
      select: this.resetTargetSelect,
    });
  }

  async findUserByResetToken(
    token: string,
    now: Date,
  ): Promise<ResetTokenTarget | null> {
    return this.prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gte: now },
      },
      select: this.resetTargetSelect,
    });
  }

  async resetAdminPassword(id: string, hashedPassword: string): Promise<void> {
    await this.prisma.admin.update({
      where: { id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });
  }

  async resetUserPassword(id: string, hashedPassword: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });
  }

  async getAdminProfile(id: string): Promise<AuthAdminProfile | null> {
    return this.prisma.admin.findUnique({
      where: { id },
      select: this.adminProfileSelect,
    });
  }

  async getUserProfile(id: string): Promise<AuthUserProfile | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: this.userProfileSelect,
    });
  }
}
