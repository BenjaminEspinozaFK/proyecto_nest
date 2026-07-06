import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PushRepositoryPort } from '../domain/push.repository';
import {
  PushSubscriptionRecord,
  CreatePushSubscriptionInput,
} from '../domain/push.types';

@Injectable()
export class PrismaPushRepository implements PushRepositoryPort {
  constructor(private prisma: PrismaService) {}

  upsertSubscription(
    data: CreatePushSubscriptionInput,
  ): Promise<PushSubscriptionRecord> {
    return this.prisma.pushSubscription.upsert({
      where: { endpoint: data.endpoint },
      create: data,
      update: data,
    });
  }

  async deleteByEndpoint(endpoint: string): Promise<void> {
    await this.prisma.pushSubscription.deleteMany({ where: { endpoint } });
  }

  findByOwner(
    ownerId: string,
    role: string,
  ): Promise<PushSubscriptionRecord[]> {
    return this.prisma.pushSubscription.findMany({
      where: role === 'admin' ? { adminId: ownerId } : { userId: ownerId },
    });
  }

  findAllAdminSubscriptions(): Promise<PushSubscriptionRecord[]> {
    return this.prisma.pushSubscription.findMany({
      where: { adminId: { not: null } },
    });
  }
}
