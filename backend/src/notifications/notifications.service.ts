import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { NotificationsRepositoryPort } from './domain/notification.repository';
import { NOTIFICATIONS_REPOSITORY } from './notifications.tokens';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(NOTIFICATIONS_REPOSITORY)
    private notificationsRepository: NotificationsRepositoryPort,
  ) {}

  async notifyUser(
    userId: string,
    title: string,
    message: string,
    link?: string,
    type = 'info',
  ) {
    return this.notificationsRepository.create({
      userId,
      title,
      message,
      link,
      type,
    });
  }

  async notifyAllAdmins(
    title: string,
    message: string,
    link?: string,
    type = 'info',
  ) {
    const adminIds = await this.notificationsRepository.findAllAdminIds();
    if (adminIds.length === 0) return;

    await this.notificationsRepository.createMany(
      adminIds.map((adminId) => ({ adminId, title, message, link, type })),
    );
  }

  async list(ownerId: string, role: string) {
    return this.notificationsRepository.listForOwner(ownerId, role);
  }

  async unreadCount(ownerId: string, role: string) {
    const count = await this.notificationsRepository.countUnread(
      ownerId,
      role,
    );
    return { count };
  }

  async markAsRead(id: string, ownerId: string, role: string) {
    const notification = await this.notificationsRepository.findById(id);

    if (!notification) {
      throw new UnauthorizedException('Notificación no encontrada');
    }

    const belongsToOwner =
      role === 'admin'
        ? notification.adminId === ownerId
        : notification.userId === ownerId;

    if (!belongsToOwner) {
      throw new UnauthorizedException(
        'No puedes modificar esta notificación',
      );
    }

    await this.notificationsRepository.markAsRead(id);

    return { message: 'Notificación marcada como leída' };
  }

  async markAllAsRead(ownerId: string, role: string) {
    await this.notificationsRepository.markAllAsRead(ownerId, role);
    return { message: 'Todas las notificaciones marcadas como leídas' };
  }
}
