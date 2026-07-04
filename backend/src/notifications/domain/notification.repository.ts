import { Notification, CreateNotificationInput } from './notification.types';

export interface NotificationsRepositoryPort {
  create(data: CreateNotificationInput): Promise<Notification>;
  createMany(data: CreateNotificationInput[]): Promise<void>;
  findAllAdminIds(): Promise<string[]>;
  listForOwner(ownerId: string, role: string): Promise<Notification[]>;
  countUnread(ownerId: string, role: string): Promise<number>;
  findById(id: string): Promise<Notification | null>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(ownerId: string, role: string): Promise<void>;
}
