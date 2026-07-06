export interface PushSubscriptionRecord {
  id: string;
  userId: string | null;
  adminId: string | null;
  endpoint: string;
  p256dh: string;
  auth: string;
  createdAt: Date;
}

export interface CreatePushSubscriptionInput {
  userId?: string;
  adminId?: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface PushPayload {
  title: string;
  message: string;
  link?: string;
}
