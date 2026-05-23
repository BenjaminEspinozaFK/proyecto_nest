import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserRepositoryPort } from '../domain/user.repository';
import {
  CreateUserInput,
  UpdateUserInput,
  User,
  UserPublic,
} from '../domain/user.types';

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  private userSelect = {
    id: true,
    email: true,
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

  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<UserPublic[]> {
    return this.prisma.user.findMany({ select: this.userSelect });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByIdPublic(id: string): Promise<UserPublic | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: this.userSelect,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(data: CreateUserInput): Promise<UserPublic> {
    return this.prisma.user.create({
      data,
      select: this.userSelect,
    });
  }

  async update(id: string, data: UpdateUserInput): Promise<UserPublic> {
    return this.prisma.user.update({
      where: { id },
      data,
      select: this.userSelect,
    });
  }

  async updateAvatar(id: string, avatar: string): Promise<UserPublic> {
    return this.prisma.user.update({
      where: { id },
      data: { avatar },
      select: this.userSelect,
    });
  }

  async updatePassword(
    id: string,
    password: string,
    requirePasswordChange: boolean,
  ): Promise<UserPublic> {
    return this.prisma.user.update({
      where: { id },
      data: { password, requirePasswordChange },
      select: this.userSelect,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
