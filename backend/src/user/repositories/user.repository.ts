import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { User } from '@prisma/client';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  protected modelName = 'user';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByRut(rut: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { rut } });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findAllActive(skip?: number, take?: number): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { deletedAt: null },
      skip,
      take,
    });
  }

  async findAllWithSelect(
    select: any,
    skip?: number,
    take?: number,
  ): Promise<any[]> {
    return this.prisma.user.findMany({
      select,
      skip,
      take,
    });
  }

  async findByIdWithSelect(
    id: string,
    select: any,
  ): Promise<Record<string, unknown> | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select,
    });
  }

  async findByEmailWithSelect(
    email: string,
    select: any,
  ): Promise<Record<string, unknown> | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select,
    });
  }

  async updateWithSelect(id: string, data: any, select: any): Promise<any> {
    return this.prisma.user.update({
      where: { id },
      data,
      select,
    });
  }

  async createWithSelect(data: any, select: any): Promise<any> {
    return this.prisma.user.create({
      data,
      select,
    });
  }
}
