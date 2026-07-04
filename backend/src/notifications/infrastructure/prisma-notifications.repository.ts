import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { NotificationsRepositoryPort } from '../domain/notification.repository';
import {
  Notification,
  CreateNotificationInput,
} from '../domain/notification.types';

@Injectable()
export class PrismaNotificationsRepository
  implements NotificationsRepositoryPort
{
  constructor(private prisma: PrismaService) {}

  create(data: CreateNotificationInput): Promise<Notification> {
    return this.prisma.notification.create({ data });
  }

  async createMany(data: CreateNotificationInput[]): Promise<void> {
    await this.prisma.notification.createMany({ data });
  }

  async findAllAdminIds(): Promise<string[]> {
    const admins = await this.prisma.admin.findMany({ select: { id: true } });
    return admins.map((admin) => admin.id);
  }

  listForOwner(ownerId: string, role: string): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: role === 'admin' ? { adminId: ownerId } : { userId: ownerId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  countUnread(ownerId: string, role: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        ...(role === 'admin' ? { adminId: ownerId } : { userId: ownerId }),
        read: false,
      },
    });
  }

  findById(id: string): Promise<Notification | null> {
    return this.prisma.notification.findUnique({ where: { id } });
  }

  async markAsRead(id: string): Promise<void> {
    await this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllAsRead(ownerId: string, role: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: {
        ...(role === 'admin' ? { adminId: ownerId } : { userId: ownerId }),
        read: false,
      },
      data: { read: true },
    });
  }
}
