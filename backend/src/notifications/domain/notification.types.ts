export interface Notification {
  id: string;
  userId: string | null;
  adminId: string | null;
  title: string;
  message: string;
  type: string;
  link: string | null;
  read: boolean;
  createdAt: Date;
}

export interface CreateNotificationInput {
  userId?: string;
  adminId?: string;
  title: string;
  message: string;
  type?: string;
  link?: string;
}
